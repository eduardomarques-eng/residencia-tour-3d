'use client';

import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { Compass } from 'lucide-react';
import { useTourStore } from '@/store/useTourStore';

export function LoadingScreen() {
  const { active, progress, loaded, total, item } = useProgress();
  const isSceneReady = useTourStore((state) => state.isSceneReady);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Combina o progresso real do Three.js LoadingManager (useProgress)
    // com a prontidão do Canvas WebGL para uma transição suave até 100%
    const targetProgress =
      total > 0 ? progress : isSceneReady && !active ? 100 : Math.min(progress || 35, 90);

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= 100 && !active && isSceneReady) {
          clearInterval(interval);
          return 100;
        }
        const delta = Math.max(1, (targetProgress - prev) * 0.18);
        const next = Math.min(100, prev + delta);
        return next > 99.2 && targetProgress === 100 ? 100 : next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [progress, active, total, isSceneReady]);

  useEffect(() => {
    if (displayProgress >= 100 && !active && isSceneReady) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 450);
      return () => clearTimeout(timeout);
    }
  }, [displayProgress, active, isSceneReady]);

  if (!isVisible) return null;

  const isFadingOut = displayProgress >= 100 && !active && isSceneReady;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#07080a] text-white px-6 py-12 transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Topo da Tela de Loading */}
      <div className="w-full max-w-md flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-zinc-500">
        <span>Arqvertic 3D Engine</span>
        <span>WebGL 2.0 // PBR</span>
      </div>

      {/* Centro: Identidade Arquitetônica & Progresso Real */}
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(251,191,36,0.08)]">
          <Compass className="w-6 h-6 text-amber-200 animate-pulse" />
        </div>

        <span className="text-[11px] uppercase tracking-[0.35em] text-amber-200/80 mb-2">
          Experiência Arquitetônica Imersiva
        </span>
        <h2 className="text-2xl sm:text-3xl font-light tracking-wider text-zinc-100 mb-2">
          VILLA HORIZONTE
        </h2>
        <p className="text-xs text-zinc-400 font-light max-w-xs mb-10">
          Inicializando geometria arquitetônica, iluminação física e shaders de pós-processamento.
        </p>

        {/* Barra de Progresso Glassmorphism */}
        <div className="w-full bg-white/[0.04] border border-white/10 rounded-full h-2 p-0.5 overflow-hidden backdrop-blur-md">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300/70 via-amber-200 to-white transition-all duration-150 ease-out shadow-[0_0_16px_rgba(252,211,77,0.6)]"
            style={{ width: `${ Math.round(displayProgress) }%` }}
          />
        </div>

        {/* Telemetria do useProgress */}
        <div className="w-full flex items-center justify-between mt-3 text-[11px] font-mono text-zinc-400">
          <span className="truncate max-w-[240px] text-zinc-500">
            {item
              ? `Carregando: ${item.split('/').pop()}`
              : total > 0
              ? `Assets (${loaded}/${total})`
              : 'Compilando Shaders PBR & Iluminação...'}
          </span>
          <span className="text-amber-200 font-medium">
            {Math.round(displayProgress)}%
          </span>
        </div>
      </div>

      {/* Rodapé da Tela de Loading */}
      <div className="w-full max-w-md flex items-center justify-center text-[11px] text-zinc-600 tracking-widest uppercase">
        <span>Passeio Virtual Interativo em Tempo Real</span>
      </div>
    </div>
  );
}

