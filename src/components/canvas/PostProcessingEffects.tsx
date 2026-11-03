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

  // Perfil Adaptativo Reduzido (< 45 FPS ou modo 'balanced'):
  // Desativa N8AO e reduz a resolução interna do EffectComposer/Bloom para manter fluidez em mobile
  if (qualityPreset === 'balanced') {
    return (
      <EffectComposer
        enableNormalPass={false}
        multisampling={0}
        resolutionScale={0.65}
      >
        <Bloom
          luminanceThreshold={1.15}
          mipmapBlur
          intensity={0.28}
          levels={3}
        />
        <SMAA />
        <Vignette darkness={0.35} offset={0.18} />
      </EffectComposer>
    );
  }

  // Perfil Gráfico Completo (60 FPS estável / modo 'ultra'):
  // DPR 2, N8AO ativo, Bloom fotográfico em resolução total, SMAA e Vignette
  return (
    <EffectComposer
      enableNormalPass
      multisampling={0}
      resolutionScale={1}
      {...({ disableNormalPass: false } as Record<string, unknown>)}
    >
      <N8AO
        aoRadius={0.5}
        intensity={2}
        distanceFalloff={1.0}
        quality="high"
      />
      <Bloom luminanceThreshold={1.1} mipmapBlur intensity={0.4} levels={6} />
      <SMAA />
      <Vignette darkness={0.35} offset={0.18} />
    </EffectComposer>
  );
}
