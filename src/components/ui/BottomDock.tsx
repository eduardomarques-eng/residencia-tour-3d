'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Maximize,
  Move,
  Info,
  X,
} from 'lucide-react';
import { useTourStore } from '@/store/useTourStore';

export function BottomDock() {
  const {
    currentRoom,
    setCurrentRoom,
    pointsOfInterest,
    nextRoom,
    prevRoom,
    navigationMode,
    getCurrentPOI,
  } = useTourStore();

  const [showSpecs, setShowSpecs] = useState(false);
  const currentPOI = getCurrentPOI();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none px-4 sm:px-6 pb-5 sm:pb-6 flex flex-col items-center gap-3">
      {/* Card Contextual de Especificações Arquitetônicas (Expansível) */}
      {showSpecs && (
        <div className="pointer-events-auto w-full max-w-2xl bg-zinc-950/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_16px_48px_rgba(0,0,0,0.65)] transition-all duration-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-amber-200/80 mb-1">
                <span>Ficha Técnica // Ambiente {currentPOI.code}</span>
              </div>
              <h2 className="text-base sm:text-lg font-light text-white">
                {currentPOI.name}{' '}
                <span className="text-zinc-400 text-sm">— {currentPOI.subtitle}</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowSpecs(false)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              aria-label="Fechar especificações"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-2.5 text-xs sm:text-sm text-zinc-300/90 leading-relaxed font-light">
            {currentPOI.description}
          </p>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">
                  Área Útil
                </span>
                <span className="text-zinc-200 font-medium">{currentPOI.area}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">
                  Pé-Direito
                </span>
                <span className="text-zinc-200 font-medium">
                  {currentPOI.ceilingHeight}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {currentPOI.materials.map((material) => (
                <span
                  key={material}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-amber-100/85 tracking-wide"
                >
                  {material}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dica Sutil de Interação */}
      <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-zinc-950/55 backdrop-blur-md border border-white/10 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Move className="w-3 h-3 text-amber-200/80" />
          {navigationMode === 'walk'
            ? 'Arraste para olhar ao redor • Teclas WASD ou Setas para caminhar'
            : 'Arraste para orbitar a maquete 3D • Scroll para zoom'}
        </span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <button
          type="button"
          onClick={() => setShowSpecs(!showSpecs)}
          className="flex items-center gap-1 text-amber-200/90 hover:text-amber-100 transition-colors font-medium"
        >
          <Info className="w-3 h-3" />
          <span>{showSpecs ? 'Ocultar Ficha' : 'Detalhes do Ambiente'}</span>
        </button>
      </div>

      {/* Menu Inferior Flutuante com Carrossel de Ambientes */}
      <nav
        aria-label="Seletor de ambientes"
        className="pointer-events-auto flex items-center gap-2 bg-zinc-950/70 backdrop-blur-md border border-white/10 rounded-3xl p-2 shadow-[0_16px_48px_rgba(0,0,0,0.6)] max-w-full overflow-x-auto no-scrollbar"
      >
        {/* Botão Ambiente Anterior */}
        <button
          type="button"
          onClick={prevRoom}
          aria-label="Ambiente anterior"
          className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Lista / Carrossel de Ambientes */}
        <div className="flex items-center gap-1.5 px-1">
          {pointsOfInterest.map((poi) => {
            const isSelected = currentRoom === poi.id;
            return (
              <button
                key={poi.id}
                type="button"
                onClick={() => setCurrentRoom(poi.id)}
                className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left transition-all duration-300 flex-shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                    : 'bg-transparent hover:bg-white/5 border border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {/* Código Numérico do Cômodo */}
                <span
                  className={`text-[11px] font-mono tracking-widest px-2 py-0.5 rounded-md transition-colors ${
                    isSelected
                      ? 'bg-amber-200/20 text-amber-200 border border-amber-200/30'
                      : 'bg-white/5 text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  {poi.code}
                </span>

                {/* Nome e Metragem */}
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap">
                    {poi.name}
                  </span>
                  <span className="text-[10px] text-zinc-400/80 hidden sm:flex items-center gap-1.5">
                    <Maximize className="w-2.5 h-2.5 text-amber-200/60" />
                    {poi.area} • PD {poi.ceilingHeight}
                  </span>
                </div>

                {/* Indicador Luminoso Inferior */}
                {isSelected && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Botão Próximo Ambiente */}
        <button
          type="button"
          onClick={nextRoom}
          aria-label="Próximo ambiente"
          className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </footer>
  );
}

