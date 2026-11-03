'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore, TimeOfDay } from '@/store/useTourStore';

const GLB_MODEL_URL = '/models/residencia.glb';
const DRACO_DECODER_PATH = '/draco-gltf/';

/**
 * Percorre todos os nós da cena (seja do arquivo /models/residencia.glb do 3ds Max ou do fallback procedural),
 * habilitando castShadow/receiveShadow, configurando reflexos físicos PBR e aplicando emissão dinâmica
 * nas malhas com prefixo LIGHT_ ou EMISSIVE_.
 */
export function configureSceneNodes(
  root: THREE.Object3D,
  timeOfDay: TimeOfDay
) {
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  // Intensidade emissiva para malhas LIGHT_ e EMISSIVE_ (ultrapassa o threshold 1.1 do Bloom)
  const lightEmissiveIntensity = isNight ? 3.6 : isSunset ? 2.4 : 0.35;

  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;

    const nodeNameUpper = (node.name || '').toUpperCase();
    const isLightOrEmissive =
      nodeNameUpper.startsWith('LIGHT_') ||
      nodeNameUpper.startsWith('EMISSIVE_') ||
      nodeNameUpper.includes('LIGHT_') ||
      nodeNameUpper.includes('EMISSIVE_');

    const isGlassMesh =
      nodeNameUpper.includes('GLASS') || nodeNameUpper.includes('VIDRO');

    // Malhas emissivas e vidros não bloqueiam sombras direcionais; demais malhas projetam e recebem sombras
    node.castShadow = !isGlassMesh && !isLightOrEmissive;
    node.receiveShadow = true;

    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material];

    materials.forEach((mat) => {
      if (!mat) return;

      if (
        mat instanceof THREE.MeshStandardMaterial ||
        mat instanceof THREE.MeshPhysicalMaterial
      ) {
        mat.envMapIntensity = 1.2;

        // Tratamento especial para malhas nomeadas com prefixo LIGHT_ ou EMISSIVE_
        if (isLightOrEmissive) {
          if (!mat.emissive || mat.emissive.getHex() === 0x000000) {
            mat.emissive = new THREE.Color('#ffdfa3');
          }
          if (mat.map && !mat.emissiveMap) {
            mat.emissiveMap = mat.map;
          }
          mat.emissiveIntensity = lightEmissiveIntensity;
          mat.toneMapped = false;
        }

        mat.needsUpdate = true;
      }
    });
  });
}

/**
 * Subcomponente leitor do arquivo final /public/models/residencia.glb com suporte a Draco Decoder (/draco-gltf/)
 */
function GltfSceneReader({ url }: { url: string }) {
  const { scene } = useGLTF(url, DRACO_DECODER_PATH);
  const { timeOfDay } = useTourStore();

  useEffect(() => {
    if (scene) {
      configureSceneNodes(scene, timeOfDay);
    }
  }, [scene, timeOfDay]);

  return <primitive object={scene} dispose={null} />;
}

/**
 * Cena Arquitetônica Procedural de Demonstração (Fallback enquanto /public/models/residencia.glb não for inserido)
 * Inclui:
 * - Piso em placas de concreto moduladas com leve reflexo físico
 * - Painéis de madeira ripada 3D e paredes claras
 * - Grandes esquadrias de vidro com transparência e reflexo (MeshPhysicalMaterial)
 * - Linhas de LED embutidas no teto (LIGHT_*) e arandelas externas (EMISSIVE_*) que acendem à noite
 */
function ProceduralArchitecturalFallback() {
  const rootRef = useRef<THREE.Group>(null);
  const fireLightRef = useRef<THREE.PointLight>(null);
  const { timeOfDay, qualityPreset } = useTourStore();

  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';
  const interiorLightMultiplier = isNight ? 1.9 : isSunset ? 1.25 : 0.25;
  const sconceLightIntensity = isNight ? 2.4 : isSunset ? 1.3 : 0.0;

  useEffect(() => {
    if (rootRef.current) {
      configureSceneNodes(rootRef.current, timeOfDay);
    }
  }, [timeOfDay]);

  useFrame(({ clock }) => {
    if (fireLightRef.current) {
      const t = clock.getElapsedTime();
      fireLightRef.current.intensity =
        (1.4 + Math.sin(t * 7.5) * 0.16 + Math.cos(t * 12.0) * 0.1) *
        Math.max(interiorLightMultiplier, 0.5);
    }
  });

  // Coordenadas das Placas de Concreto Polido (Grid 4x4 para juntas aparentes realistas)
  const concreteSlabs: [number, number][] = [];
  for (let gx = -5.25; gx <= 5.25; gx += 3.5) {
    for (let gz = -4.8; gz <= 2.2; gz += 2.3) {
      concreteSlabs.push([gx, gz]);
    }
  }

  // Coordenadas das Arandelas Externas (Fachada e Varanda Gourmet)
  const exteriorSconces: { pos: [number, number, number]; rotY: number }[] = [
    { pos: [-6.68, 2.1, 3.88], rotY: 0 },
    { pos: [-2.2, 2.1, 3.88], rotY: 0 },
    { pos: [2.2, 2.1, 3.88], rotY: 0 },
    { pos: [6.68, 2.1, 3.88], rotY: 0 },
    { pos: [-6.68, 2.1, 1.5], rotY: Math.PI / 2 },
    { pos: [-6.68, 2.1, -2.5], rotY: Math.PI / 2 },
  ];

  return (
    <group ref={rootRef} name="ProceduralMinimalistResidence">
      {/* =====================================================================
          1. TERRENO E PISO EM PLACAS DE CONCRETO COM REFLEXO FÍSICO
      ===================================================================== */}
      <mesh
        name="GroundTerrain"
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#121514" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Sub-base escura para criar o friso (junta de dilatação) entre as placas de concreto */}
      <mesh position={[0, 0.07, -1.2]} receiveShadow>
        <boxGeometry args={[14.3, 0.14, 10.6]} />
        <meshStandardMaterial color="#2a2b2e" roughness={0.8} />
      </mesh>

      {/* Camada Reflexiva Fina sob o Piso Principal (Modo Ultra) */}
      {qualityPreset === 'ultra' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.162, -1.2]} receiveShadow>
          <planeGeometry args={[13.9, 10.2]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mixBlur={0.9}
            mixStrength={12}
            roughness={0.26}
            depthScale={0.6}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#d2cdc4"
            metalness={0.12}
            mirror={0.32}
          />
        </mesh>
      )}

      {/* Placas Modulares de Concreto Polido com Reflexo Físico (Clearcoat) */}
      {concreteSlabs.map(([x, z], idx) => (
        <mesh
          key={`concrete-slab-${idx}`}
          name={`ConcreteSlab_${idx}`}
          position={[x, 0.15, z]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[3.46, 0.022, 2.26]} />
          <meshPhysicalMaterial
            color="#d5d0c7"
            roughness={0.22}
            metalness={0.06}
            clearcoat={0.55}
            clearcoatRoughness={0.18}
            reflectivity={0.65}
          />
        </mesh>
      ))}

      {/* Deck Externo e Piso da Varanda Gourmet em Placas de Concreto Travertino & Madeira */}
      <mesh position={[0, 0.08, 6.2]} receiveShadow castShadow>
        <boxGeometry args={[14.6, 0.15, 5.6]} />
        <meshPhysicalMaterial
          color="#cbc5ba"
          roughness={0.32}
          metalness={0.05}
          clearcoat={0.3}
        />
      </mesh>

      {/* Passarela de Placas Flutuantes da Fachada */}
      {[9.4, 10.6, 11.8].map((zPos, idx) => (
        <mesh
          key={`entry-slab-${idx}`}
          position={[0, 0.07, zPos]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[2.8, 0.08, 0.92]} />
          <meshPhysicalMaterial
            color="#dad4ca"
            roughness={0.28}
            clearcoat={0.4}
          />
        </mesh>
      ))}

      {/* Espelho D'água / Piscina Minimalista na Fachada */}
      <mesh position={[3.2, -0.12, 6.8]} receiveShadow>
        <boxGeometry args={[7.2, 0.4, 3.6]} />
        <meshStandardMaterial color="#143230" roughness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.2, 0.165, 6.8]}>
        <planeGeometry args={[6.9, 3.3]} />
        {qualityPreset === 'ultra' ? (
          <MeshReflectorMaterial
            blur={[200, 80]}
            resolution={512}
            mixBlur={0.8}
            mixStrength={26}
            roughness={0.08}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#1b585c"
            metalness={0.45}
            mirror={0.72}
          />
        ) : (
          <meshStandardMaterial color="#1b585c" roughness={0.12} metalness={0.6} />
        )}
      </mesh>
      <mesh name="LIGHT_POOL_STRIP" position={[3.2, 0.14, 5.2]}>
        <boxGeometry args={[6.8, 0.04, 0.04]} />
        <meshStandardMaterial color="#7ef9ff" emissive="#38bdf8" />
      </mesh>

      {/* =====================================================================
          2. PAREDES CLARAS ARQUITETÔNICAS & PAINÉIS DE MADEIRA RIPADA 3D
      ===================================================================== */}
      {/* Parede de Fundo Clara (Off-White Arquitetônico) */}
      <mesh position={[0, 2.4, -6.4]} castShadow receiveShadow>
        <boxGeometry args={[14.2, 4.8, 0.38]} />
        <meshStandardMaterial color="#ede8df" roughness={0.55} />
      </mesh>

      {/* Parede Lateral Esquerda Clara */}
      <mesh position={[-6.9, 2.4, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 4.8, 10.6]} />
        <meshStandardMaterial color="#ebe5dc" roughness={0.55} />
      </mesh>

      {/* Parede Lateral Direita Clara com Vão de Vidro */}
      <mesh position={[6.9, 2.4, -3.6]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 4.8, 5.6]} />
        <meshStandardMaterial color="#efeae2" roughness={0.52} />
      </mesh>
      <mesh position={[6.9, 2.4, 2.1]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 4.8, 2.8]} />
        <meshStandardMaterial color="#efeae2" roughness={0.52} />
      </mesh>

      {/* Painel Central Divisório em Madeira Ripada 3D (Entre Living e Suíte) */}
      <group position={[2.2, 2.15, -2.4]}>
        {/* Base Escura de Fundo do Ripado */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.2, 4.0, 0.16]} />
          <meshStandardMaterial color="#2b1d12" roughness={0.7} />
        </mesh>
        {/* Ripas Verticais Individuais em Freijó Natural */}
        {Array.from({ length: 28 }).map((_, idx) => {
          const xOffset = -2.02 + idx * 0.15;
          return (
            <mesh
              key={`living-slat-${idx}`}
              position={[xOffset, 0, 0.1]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.06, 4.0, 0.06]} />
              <meshPhysicalMaterial
                color="#8a5a36"
                roughness={0.42}
                clearcoat={0.25}
              />
            </mesh>
          );
        })}
      </group>

      {/* Segundo Painel de Madeira Ripada na Parede da Cozinha / Varanda */}
      <group position={[-6.65, 2.15, 2.0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.12, 4.0, 3.2]} />
          <meshStandardMaterial color="#2b1d12" roughness={0.7} />
        </mesh>
        {Array.from({ length: 20 }).map((_, idx) => {
          const zOffset = -1.5 + idx * 0.158;
          return (
            <mesh
              key={`veranda-slat-${idx}`}
              position={[0.08, 0, zOffset]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.06, 4.0, 0.06]} />
              <meshPhysicalMaterial
                color="#8a5a36"
                roughness={0.42}
                clearcoat={0.25}
              />
            </mesh>
          );
        })}
      </group>

      {/* Laje de Cobertura Clara Minimalista com Claraboia Zenital */}
      <mesh position={[-2.6, 4.65, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[9.0, 0.4, 12.8]} />
        <meshStandardMaterial color="#f2ede4" roughness={0.42} />
      </mesh>
      <mesh position={[4.5, 4.65, -4.2]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.4, 5.2]} />
        <meshStandardMaterial color="#f2ede4" roughness={0.42} />
      </mesh>
      <mesh position={[4.5, 4.65, 3.6]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.4, 4.8]} />
        <meshStandardMaterial color="#f2ede4" roughness={0.42} />
      </mesh>

      {/* Pérgolas da Claraboia Zenital sobre o Living */}
      {[2.3, 3.0, 3.7, 4.4, 5.1, 5.8].map((xPos, idx) => (
        <mesh
          key={`zenith-beam-${idx}`}
          position={[xPos, 4.62, -0.2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.14, 0.35, 3.0]} />
          <meshStandardMaterial color="#e6e0d5" roughness={0.45} />
        </mesh>
      ))}

      <mesh name="ZenithSkylightGlass" position={[4.0, 4.85, -0.2]}>
        <boxGeometry args={[4.2, 0.04, 3.0]} />
        <meshPhysicalMaterial
          color="#dcf0ff"
          transparent
          opacity={0.22}
          roughness={0.03}
          metalness={0.08}
          transmission={0.9}
          ior={1.52}
          clearcoat={1}
        />
      </mesh>

      {/* =====================================================================
          3. LINHAS DE LED EMBUTIDAS NO TETO (LIGHT_*) E ARANDELAS (EMISSIVE_*)
      ===================================================================== */}
      {/* Linhas de LED Embutidas no Teto (Acendem com malhas prefixadas LIGHT_) */}
      <mesh name="LIGHT_CEILING_LED_FACADE" position={[0, 4.44, 5.75]}>
        <boxGeometry args={[13.6, 0.03, 0.06]} />
        <meshStandardMaterial color="#ffe5b4" emissive="#ffb85c" />
      </mesh>

      <mesh name="LIGHT_CEILING_LED_LIVING" position={[1.5, 4.44, 0.5]}>
        <boxGeometry args={[0.07, 0.03, 6.2]} />
        <meshStandardMaterial color="#ffe5b4" emissive="#ffc168" />
      </mesh>

      <mesh name="LIGHT_CEILING_LED_KITCHEN" position={[-2.2, 4.44, -1.5]}>
        <boxGeometry args={[4.6, 0.03, 0.07]} />
        <meshStandardMaterial color="#ffe5b4" emissive="#ffc168" />
      </mesh>

      <mesh name="LIGHT_CEILING_LED_SUITE" position={[2.5, 4.44, -4.2]}>
        <boxGeometry args={[4.2, 0.03, 0.07]} />
        <meshStandardMaterial color="#ffe5b4" emissive="#ffb85c" />
      </mesh>

      <mesh name="LIGHT_CEILING_LED_VERANDA" position={[-2.8, 4.44, 4.5]}>
        <boxGeometry args={[5.4, 0.03, 0.07]} />
        <meshStandardMaterial color="#ffe5b4" emissive="#ffb85c" />
      </mesh>

      {/* Arandelas Externas Minimalistas (EMISSIVE_SCONCE_*) que acendem no modo Entardecer/Noite */}
      {exteriorSconces.map((sconce, idx) => (
        <group
          key={`sconce-${idx}`}
          position={sconce.pos}
          rotation={[0, sconce.rotY, 0]}
        >
          {/* Corpo da Arandela em Alumínio Preto */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.34, 0.09]} />
            <meshPhysicalMaterial
              color="#18191c"
              roughness={0.22}
              metalness={0.9}
              clearcoat={0.4}
            />
          </mesh>
          {/* Difusor Duplo Emissivo (Up / Down) com prefixo EMISSIVE_ */}
          <mesh name={`EMISSIVE_SCONCE_TOP_${idx}`} position={[0, 0.16, 0.01]}>
            <boxGeometry args={[0.08, 0.03, 0.07]} />
            <meshStandardMaterial color="#ffe2a8" emissive="#ffae42" />
          </mesh>
          <mesh
            name={`EMISSIVE_SCONCE_BOTTOM_${idx}`}
            position={[0, -0.16, 0.01]}
          >
            <boxGeometry args={[0.08, 0.03, 0.07]} />
            <meshStandardMaterial color="#ffe2a8" emissive="#ffae42" />
          </mesh>
          {/* Ponto de Luz Noturna Real */}
          {sconceLightIntensity > 0 && (
            <pointLight
              position={[0, 0, 0.22]}
              color="#ffb454"
              intensity={sconceLightIntensity}
              distance={5.5}
              decay={2}
            />
          )}
        </group>
      ))}

      {/* =====================================================================
          4. GRANDES ESQUADRIAS DE VIDRO COM TRANSPARÊNCIA E REFLEXO
      ===================================================================== */}
      {/* Fachada Principal em Vidro Duplo com Reflexo Físico */}
      <mesh name="MainFacadeGlass" position={[0, 2.2, 3.85]}>
        <boxGeometry args={[13.2, 4.1, 0.04]} />
        <meshPhysicalMaterial
          color="#d8eefb"
          transparent
          opacity={0.2}
          roughness={0.03}
          metalness={0.12}
          transmission={0.9}
          ior={1.52}
          reflectivity={0.96}
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </mesh>

      {/* Esquadria Lateral de Vidro do Living */}
      <mesh name="LivingSideGlass" position={[6.9, 2.2, -0.1]}>
        <boxGeometry args={[0.05, 4.1, 1.8]} />
        <meshPhysicalMaterial
          color="#d8eefb"
          transparent
          opacity={0.22}
          roughness={0.03}
          metalness={0.12}
          transmission={0.9}
          ior={1.52}
          clearcoat={1}
        />
      </mesh>

      {/* Montantes e Trilhos das Esquadrias Minimalistas em Alumínio Preto */}
      {[-6.68, -2.2, 2.2, 6.68].map((xPos, idx) => (
        <mesh
          key={`frame-mullion-${idx}`}
          position={[xPos, 2.2, 3.86]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.08, 4.2, 0.1]} />
          <meshPhysicalMaterial
            color="#141518"
            roughness={0.18}
            metalness={0.92}
            clearcoat={0.45}
          />
        </mesh>
      ))}

      {/* =====================================================================
          5. MOBILIÁRIO ARQUITETÔNICO DE CADA CÔMODO
      ===================================================================== */}
      {/* LIVING ([1.5, 1.6, 2] -> [3, 1.5, -1]) */}
      <group position={[3.2, 0.17, -0.8]}>
        <mesh position={[0, 0.01, 0.4]} receiveShadow>
          <boxGeometry args={[4.2, 0.02, 3.2]} />
          <meshStandardMaterial color="#c4bcb0" roughness={0.9} />
        </mesh>
        <mesh position={[0.4, 0.28, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 0.42, 0.95]} />
          <meshStandardMaterial color="#ece6de" roughness={0.8} />
        </mesh>
        <mesh position={[0.4, 0.58, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 0.45, 0.2]} />
          <meshStandardMaterial color="#e2dbd1" roughness={0.8} />
        </mesh>
        <mesh position={[0.1, 0.2, 1.15]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.26, 0.85]} />
          <meshPhysicalMaterial
            color="#18191b"
            roughness={0.12}
            metalness={0.15}
            clearcoat={0.85}
          />
        </mesh>
        {/* Lareira Linear */}
        <mesh position={[3.2, 1.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.65, 3.2, 2.4]} />
          <meshStandardMaterial color="#222428" roughness={0.45} />
        </mesh>
        <mesh name="EMISSIVE_FIREPLACE_FLAME" position={[2.84, 0.72, 0]}>
          <boxGeometry args={[0.08, 0.22, 1.6]} />
          <meshStandardMaterial color="#ff9d3b" emissive="#ff6a00" />
        </mesh>
        <pointLight
          ref={fireLightRef}
          position={[2.2, 0.9, 0]}
          color="#ff8c3b"
          intensity={1.5}
          distance={7}
        />
      </group>

      {/* COZINHA ([-2, 1.6, 1] -> [-2, 1.4, -3]) */}
      <group position={[-2.2, 0.16, -2.4]}>
        <mesh position={[0, 0.48, 0.6]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.95, 1.1]} />
          <meshPhysicalMaterial
            color="#ece5da"
            roughness={0.15}
            metalness={0.08}
            clearcoat={0.7}
          />
        </mesh>
        <mesh position={[0, 0.96, 0.68]} castShadow receiveShadow>
          <boxGeometry args={[3.3, 0.06, 1.25]} />
          <meshPhysicalMaterial
            color="#f5efe6"
            roughness={0.1}
            clearcoat={0.9}
          />
        </mesh>
        {[-0.95, 0, 0.95].map((xOffset, idx) => (
          <group key={`stool-${idx}`} position={[xOffset, 0, 1.45]}>
            <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.68, 16]} />
              <meshPhysicalMaterial
                color="#1f2023"
                metalness={0.92}
                roughness={0.18}
              />
            </mesh>
            <mesh position={[0, 0.68, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.06, 24]} />
              <meshStandardMaterial color="#6e482c" roughness={0.5} />
            </mesh>
          </group>
        ))}
        {/* Marcenaria Superior e Inferior em Madeira Ripada + Laca Clara */}
        <mesh position={[0, 1.65, -2.2]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 3.2, 0.65]} />
          <meshStandardMaterial color="#593c26" roughness={0.48} />
        </mesh>
        <mesh name="LIGHT_KITCHEN_PENDANT" position={[0, 2.35, 0.6]}>
          <boxGeometry args={[2.5, 0.05, 0.08]} />
          <meshStandardMaterial color="#fff0d4" emissive="#ffc266" />
        </mesh>
        <pointLight
          position={[0, 2.1, 0.6]}
          color="#ffdca8"
          intensity={1.6 * Math.max(interiorLightMultiplier, 0.4)}
          distance={8}
        />
      </group>

      {/* SUÍTE ([3, 1.6, -4] -> [1, 1.4, -4]) */}
      <group position={[1.2, 0.17, -4.2]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.32, 2.2]} />
          <meshStandardMaterial color="#4a3423" roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 0.42, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.1, 0.28, 2.0]} />
          <meshStandardMaterial color="#f2ede4" roughness={0.8} />
        </mesh>
        <mesh
          name="LIGHT_SUITE_HEADBOARD"
          position={[-1.04, 2.06, 0]}
        >
          <boxGeometry args={[0.04, 0.04, 3.1]} />
          <meshStandardMaterial color="#ffe2b0" emissive="#ffb54c" />
        </mesh>
        <pointLight
          position={[0.6, 2.4, 0]}
          color="#ffd9a0"
          intensity={1.4 * Math.max(interiorLightMultiplier, 0.35)}
          distance={7.5}
        />
      </group>

      {/* VARANDA GOURMET ([-3, 1.6, 5] -> [-1, 1.5, 2]) */}
      <group position={[-1.6, 0.16, 3.2]}>
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.07, 1.1]} />
          <meshStandardMaterial color="#6e472b" roughness={0.45} />
        </mesh>
        {[-0.9, 0.9].map((xLeg, idx) => (
          <mesh
            key={`table-leg-${idx}`}
            position={[xLeg, 0.36, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.1, 0.72, 0.85]} />
            <meshPhysicalMaterial
              color="#1b1c1f"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        ))}
        <mesh position={[-3.4, 0.48, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.85, 0.95, 2.8]} />
          <meshStandardMaterial color="#27292c" roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}

export function SceneModel() {
  const [hasFinalGlb, setHasFinalGlb] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetch(GLB_MODEL_URL, { method: 'HEAD' })
      .then((res) => {
        if (
          isMounted &&
          res.ok &&
          !res.headers.get('content-type')?.includes('text/html')
        ) {
          setHasFinalGlb(true);
        }
      })
      .catch(() => {
        if (isMounted) setHasFinalGlb(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (hasFinalGlb) {
    return <GltfSceneReader url={GLB_MODEL_URL} />;
  }

  return <ProceduralArchitecturalFallback />;
}

