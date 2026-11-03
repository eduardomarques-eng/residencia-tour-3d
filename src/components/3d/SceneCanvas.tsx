'use client';

import React, { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor, PerformanceMonitorApi } from '@react-three/drei';
import * as THREE from 'three';
import { useTourStore } from '@/store/useTourStore';
import { EnvironmentSetup } from '@/components/canvas/EnvironmentSetup';
import { SceneModel } from '@/components/3d/SceneModel';
import { CameraController } from '@/components/3d/CameraController';
import { PostProcessingEffects } from '@/components/canvas/PostProcessingEffects';

export function SceneCanvas() {
  const {
    adaptiveDpr,
    setAdaptivePerformance,
    setIsSceneReady,
  } = useTourStore();

  // Quando o FPS se mantém estável próximo a 60 FPS -> Perfil Gráfico Completo (DPR 2, N8AO, Reflexos)
  const handlePerformanceIncline = useCallback(
    (api: PerformanceMonitorApi) => {
      setAdaptivePerformance(2, 'ultra', api.fps);
    },
    [setAdaptivePerformance]
  );

  // Quando o FPS cai abaixo de 45 FPS -> Reduz DPR para 1, desativa N8AO e reduz resolução do Bloom
  const handlePerformanceDecline = useCallback(
    (api: PerformanceMonitorApi) => {
      setAdaptivePerformance(1, 'balanced', api.fps);
    },
    [setAdaptivePerformance]
  );

  const handlePerformanceChange = useCallback(
    (api: PerformanceMonitorApi) => {
      if (api.fps < 45) {
        setAdaptivePerformance(1, 'balanced', api.fps);
      } else if (api.fps >= 58) {
        setAdaptivePerformance(2, 'ultra', api.fps);
      }
    },
    [setAdaptivePerformance]
  );

  return (
    <div className="relative w-full h-screen bg-[#07080a] overflow-hidden select-none">
      <Canvas
        shadows="soft"
        dpr={adaptiveDpr}
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
        <PerformanceMonitor
          bounds={() => [45, 58]}
          flipflops={3}
          onIncline={handlePerformanceIncline}
          onDecline={handlePerformanceDecline}
          onChange={handlePerformanceChange}
          onFallback={() => setAdaptivePerformance(1, 'balanced', 30)}
        />

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

