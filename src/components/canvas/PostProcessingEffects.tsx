'use client';

import React from 'react';
import {
  EffectComposer,
  N8AO,
  Bloom,
  SMAA,
  Vignette,
} from '@react-three/postprocessing';
import { useTourStore } from '@/store/useTourStore';

export function PostProcessingEffects() {
  const { qualityPreset } = useTourStore();

  // No modo 'balanced', desativa o N8AO mais pesado mantendo Bloom, SMAA e Vignette
  if (qualityPreset === 'balanced') {
    return (
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom luminanceThreshold={1.1} mipmapBlur intensity={0.35} />
        <SMAA />
        <Vignette darkness={0.35} offset={0.18} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer
      enableNormalPass
      multisampling={0}
      {...({ disableNormalPass: false } as Record<string, unknown>)}
    >
      <N8AO
        aoRadius={0.5}
        intensity={2}
        distanceFalloff={1.0}
        quality="high"
      />
      <Bloom luminanceThreshold={1.1} mipmapBlur intensity={0.4} />
      <SMAA />
      <Vignette darkness={0.35} offset={0.18} />
    </EffectComposer>
  );
}
