'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Footprints,
  Orbit,
  Sun,
  Sunset,
  Moon,
  Maximize2,
  Minimize2,
  Sparkles,
  Gauge,
  Compass,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  useTourStore,
  NavigationMode,
  TimeOfDay,
} from '@/store/useTourStore';

export function TopBar() {
  const {
    navigationMode,
    setNavigationMode,
    timeOfDay,
    setTimeOfDay,
    qualityPreset,
    setQualityPreset,
    showHotspots,
    setShowHotspots,
    getCurrentPOI,
  } = useTourStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const currentPOI = getCurrentPOI();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Erro ao alternar tela cheia:', err);
    }
  }, []);

  const navModes: { id: NavigationMode; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'walk',
      label: 'Passeio Virtual (1ª Pessoa)',
      shortLabel: '1ª Pessoa',
      icon: <Footprints className="w-3.5 h-3.5" />,
    },
    {
      id: 'orbit',
      label: 'Visão Geral (Órbita)',
      shortLabel: 'Órbita 3D',
      icon: <Orbit className="w-3.5 h-3.5" />,
    },
  ];

  const lightingModes: { id: TimeOfDay; label: string; icon: React.ReactNode }[] = [
    { id: 'day', label: 'Dia', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'sunset', label: 'Entardecer', icon: <Sunset className="w-3.5 h-3.5" /> },
    { id: 'night', label: 'Noite', icon: <Moon className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none px-4 sm:px-6 pt-4 sm:pt-5">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Identidade do Projeto Arquitetônico */}
        <div className="pointer-events-auto flex items-center gap-3.5 bg-zinc-950/65 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-200/20 via-amber-400/10 to-transparent border border-amber-200/30 flex items-center justify-center text-amber-200">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.28em] text-amber-200/80 font-medium">
                Arqvertic Studio
              </span>
              <span className="w-1 h-1 rounded-full bg-white/25" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 hidden sm:inline">
                {currentPOI.code} — {currentPOI.area}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-light tracking-wide text-zinc-100">
              Villa Horizonte{' '}
              <span className="text-zinc-500 font-normal hidden md:inline">
                | Residência Suspensa
              </span>
            </h1>
          </div>
        </div>

        {/* Controles Centrais: Modo de Navegação (Passeio 1ª Pessoa vs Visão Geral Órbita) */}
        <div className="pointer-events-auto flex items-center bg-zinc-950/65 backdrop-blur-md border border-white/10 rounded-2xl p-1 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          {navModes.map((mode) => {
            const isActive = navigationMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setNavigationMode(mode.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-white/12 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] border border-white/15'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-amber-200' : 'text-zinc-400'}>
                  {mode.icon}
                </span>
                <span className="hidden lg:inline tracking-wide">{mode.label}</span>
                <span className="lg:hidden tracking-wide">{mode.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Controles Direitos: Iluminação (Dia/Entardecer/Noite), Qualidade, Hotspots e Tela Cheia */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Seletor de Iluminação Solar */}
          <div
            className="flex items-center bg-zinc-950/65 backdrop-blur-md border border-white/10 rounded-2xl p-1 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
            role="group"
            aria-label="Controle de iluminação"
          >
            {lightingModes.map((light) => {
              const isActive = timeOfDay === light.id;
              return (
                <button
                  key={light.id}
                  type="button"
                  onClick={() => setTimeOfDay(light.id)}
                  title={`Iluminação: ${light.label}`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-200/15 text-amber-100 border border-amber-200/30 shadow-[0_0_15px_rgba(251,191,36,0.12)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-amber-300' : 'text-zinc-400'}>
                    {light.icon}
                  </span>
                  <span className="hidden sm:inline tracking-wide">{light.label}</span>
                </button>
              );
            })}
          </div>

          {/* Botão de Hotspots 3D */}
          <button
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            title={showHotspots ? 'Ocultar Marcadores 3D' : 'Mostrar Marcadores 3D'}
            className={`hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-medium bg-zinc-950/65 backdrop-blur-md border transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${
              showHotspots
                ? 'border-white/15 text-zinc-200 hover:bg-white/10'
                : 'border-white/10 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {showHotspots ? (
              <Eye className="w-3.5 h-3.5 text-amber-200/80" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span className="hidden xl:inline">Pins</span>
          </button>

          {/* Seletor de Qualidade Gráfica (Ultra vs Balanced) */}
          <button
            type="button"
            onClick={() =>
              setQualityPreset(qualityPreset === 'ultra' ? 'balanced' : 'ultra')
            }
            title={`Qualidade Gráfica: ${
              qualityPreset === 'ultra' ? 'Ultra (Pós-processamento + Sombras HD)' : 'Equilibrado (60 FPS)'
            }`}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-medium bg-zinc-950/65 backdrop-blur-md border border-white/10 hover:border-white/20 text-zinc-200 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          >
            {qualityPreset === 'ultra' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden xl:inline text-amber-100/90">Ultra</span>
              </>
            ) : (
              <>
                <Gauge className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden xl:inline text-zinc-400">Balanced</span>
              </>
            )}
          </button>

          {/* Botão Tela Cheia */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia'}
            aria-label={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia'}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-zinc-950/65 backdrop-blur-md border border-white/10 hover:border-white/25 hover:bg-white/10 text-zinc-300 hover:text-white transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

