'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TopBar } from '@/components/ui/TopBar';
import { BottomDock } from '@/components/ui/BottomDock';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ArchitecturalSpecsDrawer } from '@/components/ui/ArchitecturalSpecsDrawer';

const SceneCanvas = dynamic(
  () =>
    import('@/components/canvas/SceneCanvas').then((mod) => mod.SceneCanvas),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07080a]">
      {/* Tela de Loading com Barra de Progresso Real via useProgress */}
      <LoadingScreen />

      {/* HUD Superior Minimalista com Botão Passeio Guiado (Auto-Tour) */}
      <TopBar />

      {/* Painel Lateral Translúcido de Especificações Arquitetônicas (Botão "+") */}
      <ArchitecturalSpecsDrawer />

      {/* Núcleo Gráfico 3D WebGL (Unreal-style PBR + Post-Processing) */}
      <SceneCanvas />

      {/* Menu Inferior Flutuante com Carrossel de Ambientes e Botão "+" */}
      <BottomDock />
    </main>
  );
}
