'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import {
  Environment,
  Lightformer,
  Sky,
  Stars,
  ContactShadows,
  SoftShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTourStore, TimeOfDay } from '@/store/useTourStore';

const TRANSITION_DURATION = 1.5;

const TIME_PHASE_MAP: Record<TimeOfDay, number> = {
  day: 0,
  sunset: 0.5,
  night: 1,
};

export function EnvironmentSetup() {
  const { scene } = useThree();
  const { timeOfDay, qualityPreset } = useTourStore();

  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const zenithSpotRef = useRef<THREE.SpotLight>(null);

  // Estado contínuo de fase solar (0 = Dia, 0.5 = Pôr do Sol, 1 = Noite)
  // Permite que a transição Dia -> Noite passe pelo arco do pôr do sol em 1.5s
  const phaseRef = useRef<{ value: number }>({
    value: TIME_PHASE_MAP[timeOfDay],
  });

  const [skyParams, setSkyParams] = useState<{
    sunPosition: [number, number, number];
    turbidity: number;
    rayleigh: number;
    isNightSky: boolean;
  }>({
    sunPosition: [-26, 4.8, -16],
    turbidity: 8.5,
    rayleigh: 2.8,
    isNightSky: false,
  });

  useEffect(() => {
    const targetPhase = TIME_PHASE_MAP[timeOfDay];

    const dayBg = new THREE.Color('#c9d6e8');
    const sunsetBg = new THREE.Color('#1f1624');
    const nightBg = new THREE.Color('#07090e');

    const daySunColor = new THREE.Color('#fff8eb');
    const sunsetSunColor = new THREE.Color('#ff853b');
    const nightMoonColor = new THREE.Color('#4f70db');

    const dayAmbColor = new THREE.Color('#dce8ff');
    const sunsetAmbColor = new THREE.Color('#ffad80');
    const nightAmbColor = new THREE.Color('#16203d');

    gsap.killTweensOf(phaseRef.current);

    gsap.to(phaseRef.current, {
      value: targetPhase,
      duration: TRANSITION_DURATION,
      ease: 'power2.inOut',
      onUpdate: () => {
        const p = phaseRef.current.value; // 0..1

        // 1. Declinação do ângulo solar simulando o arco do pôr do sol antes de sumir no horizonte
        const sunX = THREE.MathUtils.lerp(22, -28, Math.min(p * 1.4, 1));
        const sunY =
          p <= 0.5
            ? THREE.MathUtils.lerp(30, 3.8, p * 2)
            : THREE.MathUtils.lerp(3.8, -8.0, (p - 0.5) * 2);
        const sunZ = THREE.MathUtils.lerp(16, -18, p);

        if (dirLightRef.current) {
          dirLightRef.current.position.set(sunX, Math.max(sunY, 2.5), sunZ);

          // Intensidade solar reduz gradualmente até a luz noturna sutil
          const dirIntensity =
            p <= 0.5
              ? THREE.MathUtils.lerp(3.2, 2.4, p * 2)
              : THREE.MathUtils.lerp(2.4, 0.28, (p - 0.5) * 2);
          dirLightRef.current.intensity = dirIntensity;

          const currentSunColor =
            p <= 0.5
              ? daySunColor.clone().lerp(sunsetSunColor, p * 2)
              : sunsetSunColor.clone().lerp(nightMoonColor, (p - 0.5) * 2);
          dirLightRef.current.color.copy(currentSunColor);
        }

        // 2. Luz Ambiental, Hemisférica e Zenital
        if (ambientLightRef.current) {
          ambientLightRef.current.intensity = THREE.MathUtils.lerp(0.48, 0.14, p);
          const ambColor =
            p <= 0.5
              ? dayAmbColor.clone().lerp(sunsetAmbColor, p * 2)
              : sunsetAmbColor.clone().lerp(nightAmbColor, (p - 0.5) * 2);
          ambientLightRef.current.color.copy(ambColor);
        }

        if (hemiLightRef.current) {
          hemiLightRef.current.intensity = THREE.MathUtils.lerp(0.68, 0.25, p);
        }

        if (zenithSpotRef.current) {
          zenithSpotRef.current.intensity = THREE.MathUtils.lerp(42, 4.5, p);
        }

        // 3. Background do Céu e Fog migrando de azul limpo para gradiente escuro crepuscular
        const bgColor =
          p <= 0.5
            ? dayBg.clone().lerp(sunsetBg, p * 2)
            : sunsetBg.clone().lerp(nightBg, (p - 0.5) * 2);

        scene.background = bgColor;
        if (scene.fog instanceof THREE.Fog) {
          scene.fog.color.copy(bgColor);
          scene.fog.near = THREE.MathUtils.lerp(24, 16, p);
          scene.fog.far = THREE.MathUtils.lerp(95, 65, p);
        }

        // Atualiza o shader atmosférico <Sky> durante o curso da animação
        const turbidity =
          p <= 0.5
            ? THREE.MathUtils.lerp(2.2, 9.2, p * 2)
            : THREE.MathUtils.lerp(9.2, 10.5, (p - 0.5) * 2);
        const rayleigh =
          p <= 0.5
            ? THREE.MathUtils.lerp(0.75, 3.0, p * 2)
            : THREE.MathUtils.lerp(3.0, 0.15, (p - 0.5) * 2);

        setSkyParams({
          sunPosition: [sunX, sunY, sunZ],
          turbidity,
          rayleigh,
          isNightSky: p > 0.78,
        });
      },
    });
  }, [timeOfDay, scene]);

  const shadowMapSize = qualityPreset === 'ultra' ? 2048 : 1024;
  const envIntensity =
    timeOfDay === 'day' ? 1.2 : timeOfDay === 'sunset' ? 1.0 : 0.6;

  return (
    <>
      <SoftShadows
        size={qualityPreset === 'ultra' ? 28 : 16}
        samples={qualityPreset === 'ultra' ? 16 : 8}
        focus={0.5}
      />

      <fog attach="fog" args={['#1a1520', 20, 78]} />

      <ambientLight ref={ambientLightRef} intensity={0.3} color="#ffb38a" />
      <hemisphereLight
        ref={hemiLightRef}
        args={['#ff9e6d', '#1f1924', 0.55]}
      />

      {/* Luz Solar Direcional Animada em 1.5s */}
      <directionalLight
        ref={dirLightRef}
        position={[-26, 4.8, -16]}
        intensity={2.4}
        color="#ff8e47"
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

      {/* Claraboia Zenital */}
      <spotLight
        ref={zenithSpotRef}
        position={[3.8, 11.5, -0.2]}
        angle={0.55}
        penumbra={0.85}
        intensity={24}
        color="#fff0d8"
        castShadow={qualityPreset === 'ultra'}
        shadow-bias={-0.0002}
        distance={24}
      />

      {/* HDRI Dinâmico Físico (<Environment>) */}
      <Environment
        resolution={qualityPreset === 'ultra' ? 512 : 256}
        frames={1}
        environmentIntensity={envIntensity}
      >
        <color
          attach="background"
          args={[
            timeOfDay === 'day'
              ? '#9ec5ff'
              : timeOfDay === 'sunset'
              ? '#3b2d54'
              : '#0b132b',
          ]}
        />
        <Lightformer
          form="rect"
          intensity={timeOfDay === 'day' ? 2.4 : timeOfDay === 'sunset' ? 1.4 : 0.5}
          color={
            timeOfDay === 'day'
              ? '#9ec5ff'
              : timeOfDay === 'sunset'
              ? '#ff7b3d'
              : '#1c2541'
          }
          scale={[30, 30, 1]}
          position={[0, 15, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="ring"
          intensity={2.0}
          color={
            timeOfDay === 'day'
              ? '#fff4e0'
              : timeOfDay === 'sunset'
              ? '#ff7b3d'
              : '#1c2541'
          }
          scale={[40, 40, 1]}
          position={[0, 2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={timeOfDay === 'night' ? 3.8 : 1.6}
          color="#ffd296"
          scale={[10, 4, 1]}
          position={[0, 3, -8]}
          target={[0, 1.5, 0]}
        />
      </Environment>

      {/* Céu Físico Interpolado ou Estrelas no Crepúsculo Noturno */}
      {!skyParams.isNightSky ? (
        <Sky
          distance={450000}
          sunPosition={skyParams.sunPosition}
          turbidity={skyParams.turbidity}
          rayleigh={skyParams.rayleigh}
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

      {/* Reflexos / Sombras de Contato habilitados no perfil gráfico completo (60 FPS / Ultra) */}
      {qualityPreset === 'ultra' && (
        <ContactShadows
          position={[0, 0.165, 0]}
          opacity={0.55}
          scale={32}
          blur={1.7}
          far={6}
          resolution={512}
          color="#080706"
        />
      )}
    </>
  );
}
