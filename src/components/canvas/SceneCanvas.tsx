'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useTourStore } from '@/store/useTourStore';
import { EnvironmentSetup } from './EnvironmentSetup';
import { SceneModel } from '@/components/3d/SceneModel';
import { CameraController } from '@/components/3d/CameraController';
import { PostProcessingEffects } from './PostProcessingEffects';

export function SceneCanvas() {
  const { setIsSceneReady } = useTourStore();

  return (
    <div className="relative w-full h-screen bg-[#07080a] overflow-hidden select-none">
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        camera={{
          position: [1.5, 1.6, 2],
          fov: 55,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        onCreated={() => {
          setIsSceneReady(true);
        }}
      >
        <Suspense fallback={null}>
          <EnvironmentSetup />
          <SceneModel />
          <CameraController />
          <PostProcessingEffects />
        </Suspense>
      </Canvas>
    </div>
  );
}
