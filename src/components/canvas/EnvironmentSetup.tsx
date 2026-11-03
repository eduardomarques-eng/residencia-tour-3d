'use client';

import React, { useMemo } from 'react';
import {
  Environment,
  Lightformer,
  Sky,
  Stars,
  ContactShadows,
  SoftShadows,
} from '@react-three/drei';
import { useTourStore } from '@/store/useTourStore';

export function EnvironmentSetup() {
  const { timeOfDay, qualityPreset } = useTourStore();

  const envConfig = useMemo(() => {
    switch (timeOfDay) {
      case 'day':
        return {
          sunPosition: [22, 30, 16] as [number, number, number],
          directionalIntensity: 3.2,
          directionalColor: '#fff8eb',
          ambientIntensity: 0.45,
          ambientColor: '#dce8ff',
          hemiSky: '#e8f1ff',
          hemiGround: '#3d352e',
          hemiIntensity: 0.65,
          fogColor: '#c9d6e8',
          fogNear: 24,
          fogFar: 95,
          turbidity: 2.2,
          rayleigh: 0.75,
          envIntensity: 1.2,
          skyZenithColor: '#9ec5ff',
          skyHorizonColor: '#fff4e0',
          sunLightformerColor: '#fff5dc',
          sunLightformerIntensity: 6,
          zenithLightIntensity: 2.4,
        };
      case 'sunset':
        return {
          sunPosition: [-26, 4.8, -16] as [number, number, number],
          directionalIntensity: 2.6,
          directionalColor: '#ff8e47',
          ambientIntensity: 0.3,
          ambientColor: '#ffb38a',
          hemiSky: '#ff9e6d',
          hemiGround: '#1f1924',
          hemiIntensity: 0.55,
          fogColor: '#1a1520',
          fogNear: 20,
          fogFar: 78,
          turbidity: 8.5,
          rayleigh: 2.8,
          envIntensity: 1.05,
          skyZenithColor: '#3b2d54',
          skyHorizonColor: '#ff7b3d',
          sunLightformerColor: '#ff8533',
          sunLightformerIntensity: 8,
          zenithLightIntensity: 1.4,
        };
      case 'night':
        return {
          sunPosition: [-15, 14, -20] as [number, number, number],
          directionalIntensity: 0.45,
          directionalColor: '#6b8cff',
          ambientIntensity: 0.15,
          ambientColor: '#1a2442',
          hemiSky: '#1c294f',
          hemiGround: '#090b10',
          hemiIntensity: 0.3,
          fogColor: '#07090e',
          fogNear: 16,
          fogFar: 65,
          turbidity: 10,
          rayleigh: 0.2,
          envIntensity: 0.65,
          skyZenithColor: '#0b132b',
          skyHorizonColor: '#1c2541',
          sunLightformerColor: '#4f75ff',
          sunLightformerIntensity: 2.2,
          zenithLightIntensity: 0.5,
        };
    }
  }, [timeOfDay]);

  const shadowMapSize = qualityPreset === 'ultra' ? 2048 : 1024;

  return (
    <>
      {/* PCSS Soft Shadows estilo Unreal Engine */}
      <SoftShadows
        size={qualityPreset === 'ultra' ? 28 : 18}
        samples={qualityPreset === 'ultra' ? 16 : 10}
        focus={0.5}
      />

      <color attach="background" args={[envConfig.fogColor]} />
      <fog
        attach="fog"
        args={[envConfig.fogColor, envConfig.fogNear, envConfig.fogFar]}
      />

      {/* Iluminação Ambiental e Hemisférica */}
      <ambientLight
        intensity={envConfig.ambientIntensity}
        color={envConfig.ambientColor}
      />
      <hemisphereLight
        args={[
          envConfig.hemiSky,
          envConfig.hemiGround,
          envConfig.hemiIntensity,
        ]}
      />

      {/* Sol / Luar Direcional Principal com Sombras Suaves de Alta Resolução */}
      <directionalLight
        position={envConfig.sunPosition}
        intensity={envConfig.directionalIntensity}
        color={envConfig.directionalColor}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={75}
        shadow-bias={-0.00035}
        shadow-normalBias={0.02}
      />

      {/* Luz Zenital Dedicada atravessando as Claraboias do Teto */}
      <spotLight
        position={[-1.2, 12.5, -0.5]}
        angle={0.55}
        penumbra={0.85}
        intensity={envConfig.zenithLightIntensity * 18}
        color={envConfig.directionalColor}
        castShadow={qualityPreset === 'ultra'}
        shadow-bias={-0.0002}
        distance={24}
      />

      {/* HDRI Dinâmico Físico (<Environment>) para Reflexos PBR em Vidros e Metais */}
      <Environment
        resolution={512}
        frames={1}
        environmentIntensity={envConfig.envIntensity}
      >
        <color attach="background" args={[envConfig.skyZenithColor]} />
        {/* Domo Zenital */}
        <Lightformer
          form="rect"
          intensity={envConfig.zenithLightIntensity}
          color={envConfig.skyZenithColor}
          scale={[30, 30, 1]}
          position={[0, 15, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* Faixa do Horizonte */}
        <Lightformer
          form="ring"
          intensity={2.2}
          color={envConfig.skyHorizonColor}
          scale={[40, 40, 1]}
          position={[0, 2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* Disco Solar HDR para Especularidade Realista */}
        <Lightformer
          form="circle"
          intensity={envConfig.sunLightformerIntensity}
          color={envConfig.sunLightformerColor}
          scale={[6, 6, 1]}
          position={envConfig.sunPosition}
          target={[0, 0, 0]}
        />
        {/* Rebatedor de Luz Quente Interna para Reflexos Convincentes */}
        <Lightformer
          form="rect"
          intensity={timeOfDay === 'night' ? 3.5 : 1.5}
          color="#ffd296"
          scale={[10, 4, 1]}
          position={[0, 3, -8]}
          target={[0, 1.5, 0]}
        />
      </Environment>

      {/* Céu Atmosférico Físico (Dia / Entardecer) ou Campo Estelar (Noite) */}
      {timeOfDay !== 'night' ? (
        <Sky
          distance={450000}
          sunPosition={envConfig.sunPosition}
          turbidity={envConfig.turbidity}
          rayleigh={envConfig.rayleigh}
          mieCoefficient={0.005}
          mieDirectionalG={0.82}
        />
      ) : (
        <Stars
          radius={80}
          depth={40}
          count={qualityPreset === 'ultra' ? 2800 : 1200}
          factor={3}
          saturation={0}
          fade
          speed={0.4}
        />
      )}

      {/* Contact Shadows para ancoragem realista do mobiliário no piso */}
      <ContactShadows
        position={[0, 0.165, 0]}
        opacity={qualityPreset === 'ultra' ? 0.55 : 0.35}
        scale={32}
        blur={1.7}
        far={6}
        resolution={qualityPreset === 'ultra' ? 512 : 256}
        color="#080706"
      />
    </>
  );
}

