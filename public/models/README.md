# Pasta de Modelos 3D (`public/models`)

Coloque o arquivo exportado **`residencia.glb`** (com ou sem compressão Draco) neste diretório:

```
public/models/residencia.glb
```

O componente `ArchitectureModel.tsx` detecta automaticamente a presença de `/models/residencia.glb`, faz o carregamento via `useGLTF` com suporte ao decoder Draco, e executa o `scene.traverse` aplicando:
- `castShadow = true` e `receiveShadow = true`
- `envMapIntensity = 1.2`
- Upgrade automático de vidros e metais para `THREE.MeshPhysicalMaterial` (`transmission`, `ior: 1.52`, `clearcoat`).

