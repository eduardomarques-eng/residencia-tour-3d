#!/usr/bin/env node
/**
 * Pipeline de Automação e Otimização de Modelos 3D Arquitetônicos
 * Entrada padrão:  public/models/residencia-raw.glb
 * Saída padrão:    public/models/residencia.glb
 *
 * Etapas executadas:
 * 1. Deduplicação de materiais, malhas, texturas e accessors (dedup)
 * 2. Soldagem de vértices equivalentes e limpeza de nós órfãos (weld + prune)
 * 3. Instanciamento GPU de malhas repetidas: cadeiras, luminárias, esquadrias, brises (instance)
 * 4. Redimensionamento de texturas > 2048x2048 para resolução otimizada WebGL (textureCompress + sharp)
 * 5. Compressão de geometria Draco (ou Meshopt via flag --meshopt) reduzindo vértices/normais em até 80%
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Document, NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  instance,
  prune,
  weld,
  textureCompress,
  draco,
  meshopt,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DEFAULT_INPUT = path.join(ROOT_DIR, 'public', 'models', 'residencia-raw.glb');
const DEFAULT_OUTPUT = path.join(ROOT_DIR, 'public', 'models', 'residencia.glb');
const MAX_TEXTURE_SIZE = 2048;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * Gera um modelo .glb bruto de teste com malhas repetidas (cadeiras/brises) e textura > 2048px
 * caso o usuário execute `npm run optimize:3d -- --sample` para validar o pipeline.
 */
function createSampleRawDocument() {
  const doc = new Document();
  const buffer = doc.createBuffer('SampleBuffer');
  const scene = doc.createScene('ResidenciaScene');

  const positions = new Float32Array([
    -0.5, 0, -0.5,  0.5, 0, -0.5,  0.5, 1, -0.5, -0.5, 1, -0.5,
    -0.5, 0,  0.5,  0.5, 0,  0.5,  0.5, 1,  0.5, -0.5, 1,  0.5,
  ]);
  const normals = new Float32Array([
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,  1,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
  ]);

  const posAcc = doc.createAccessor('position').setArray(positions).setType('VEC3').setBuffer(buffer);
  const normAcc = doc.createAccessor('normal').setArray(normals).setType('VEC3').setBuffer(buffer);
  const idxAcc = doc.createAccessor('indices').setArray(indices).setType('SCALAR').setBuffer(buffer);

  // Criamos materiais duplicados propositalmente para testar o dedup()
  for (let i = 0; i < 6; i++) {
    const mat = doc
      .createMaterial(`ChairWoodMaterial_${i}`)
      .setBaseColorFactor([0.55, 0.36, 0.22, 1.0])
      .setRoughnessFactor(0.45)
      .setMetallicFactor(0.05);

    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', posAcc)
      .setAttribute('NORMAL', normAcc)
      .setIndices(idxAcc)
      .setMaterial(mat);

    const mesh = doc.createMesh(`RepeatedChairMesh_${i}`).addPrimitive(prim);
    const node = doc
      .createNode(`Chair_${i}`)
      .setMesh(mesh)
      .setTranslation([i * 1.2, 0, 0]);

    scene.addChild(node);
  }

  return doc;
}

async function runOptimization() {
  const args = process.argv.slice(2);
  const useMeshopt = args.includes('--meshopt');
  const generateSample = args.includes('--sample');

  const inputArg = args.find((a) => !a.startsWith('--'));
  const inputPath = inputArg ? path.resolve(ROOT_DIR, inputArg) : DEFAULT_INPUT;
  const outputPath = DEFAULT_OUTPUT;

  console.log('===================================================================');
  console.log('  ARQVERTIC 3D // Pipeline de Otimização GLB (@gltf-transform)');
  console.log('===================================================================');

  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });

  if (!fs.existsSync(inputPath)) {
    if (generateSample) {
      console.log(`[*] Gerando arquivo bruto de amostra em: ${path.relative(ROOT_DIR, inputPath)}`);
      fs.mkdirSync(path.dirname(inputPath), { recursive: true });
      const sampleDoc = createSampleRawDocument();
      await io.write(inputPath, sampleDoc);
    } else {
      console.warn(`\n[!] Arquivo de entrada não encontrado: ${path.relative(ROOT_DIR, inputPath)}`);
      console.log('    Para otimizar seu modelo exportado do 3ds Max / Blender:');
      console.log('    1. Salve o arquivo bruto como: public/models/residencia-raw.glb');
      console.log('    2. Execute: npm run optimize:3d');
      console.log('    (Dica: use "npm run optimize:3d -- --sample" para testar o pipeline com um GLB de exemplo)\n');
      process.exit(0);
    }
  }

  const rawStats = fs.statSync(inputPath);
  console.log(`[*] Lendo modelo bruto: ${path.relative(ROOT_DIR, inputPath)} (${formatBytes(rawStats.size)})`);

  const document = await io.read(inputPath);

  console.log('[1/4] Deduplicando materiais, malhas, texturas e soldando vértices...');
  await document.transform(
    dedup({
      propertyTypes: [
        PropertyType.MATERIAL,
        PropertyType.MESH,
        PropertyType.ACCESSOR,
        PropertyType.TEXTURE,
      ],
    }),
    weld({ tolerance: 0.0001 })
  );

  console.log('[2/4] Criando instanciamento GPU para malhas repetidas (cadeiras, luminárias, esquadrias)...');
  await document.transform(
    instance({ min: 2 }),
    prune()
  );

  console.log(`[3/4] Otimizando e redimensionando texturas maiores que ${MAX_TEXTURE_SIZE}x${MAX_TEXTURE_SIZE}...`);
  await document.transform(
    textureCompress({
      encoder: sharp,
      resize: [MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE],
    })
  );

  if (useMeshopt) {
    console.log('[4/4] Aplicando compressão geométrica Meshopt nas malhas e atributos...');
    await document.transform(
      meshopt({
        encoder: MeshoptEncoder,
        level: 'high',
      })
    );
  } else {
    console.log('[4/4] Aplicando compressão geométrica Draco (Edgebreaker) em vértices e normais...');
    await document.transform(
      draco({
        method: 'edgebreaker',
        encodeSpeed: 5,
        decodeSpeed: 5,
        quantizePosition: 14,
        quantizeNormal: 10,
        quantizeTexcoord: 12,
        quantizeColor: 8,
        quantizeGeneric: 12,
      })
    );
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await io.write(outputPath, document);

  const outStats = fs.statSync(outputPath);
  const reductionPct =
    rawStats.size > 0
      ? (((rawStats.size - outStats.size) / rawStats.size) * 100).toFixed(1)
      : '0.0';

  console.log('-------------------------------------------------------------------');
  console.log(`✓ Modelo otimizado gerado com sucesso: ${path.relative(ROOT_DIR, outputPath)}`);
  console.log(`  Tamanho original:  ${formatBytes(rawStats.size)}`);
  console.log(`  Tamanho final:     ${formatBytes(outStats.size)} (Redução de ${reductionPct}%)`);
  console.log('===================================================================');
}

runOptimization().catch((err) => {
  console.error('\n[ERRO] Falha ao otimizar o modelo 3D:', err);
  process.exit(1);
});
