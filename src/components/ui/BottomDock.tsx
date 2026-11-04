'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Move,
  Plus,
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
    isAutoTour,
    setIsAutoTour,
    isSpecsPanelOpen,
    setIsSpecsPanelOpen,
    openRoomSpecs,
  } = useTourStore();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none px-4 sm:px-6 pb-5 sm:pb-6 flex flex-col items-center gap-2.5">
      {/* Dica Sutil de Interação / Status do Passeio Guiado */}
      <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-zinc-950/55 backdrop-blur-md border border-white/10 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Move className="w-3 h-3 text-amber-200/80" />
          {isAutoTour
            ? 'Passeio Guiado ativo (6s por ambiente com rotação panorâmica)'
            : navigationMode === 'walk'
            ? 'Arraste para girar 360° • Toque no piso ou use WASD para caminhar'
            : 'Arraste para orbitar a maquete 3D • Scroll para zoom'}
        </span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <button
          type="button"
          onClick={() => setIsSpecsPanelOpen(!isSpecsPanelOpen)}
          className="flex items-center gap-1 text-amber-200/90 hover:text-amber-100 transition-colors font-medium"
        >
          <Plus className="w-3 h-3" />
          <span>
            {isSpecsPanelOpen ? 'Ocultar Especificações' : 'Ficha Técnica (+)'}
          </span>
        </button>
      </div>

      {/* Menu Inferior Flutuante com Carrossel de Ambientes e Botão Discreto "+" */}
      <nav
        aria-label="Seletor de ambientes"
        className="pointer-events-auto flex items-center gap-2 bg-zinc-950/70 backdrop-blur-md border border-white/10 rounded-3xl p-2 shadow-[0_16px_48px_rgba(0,0,0,0.6)] max-w-full overflow-x-auto no-scrollbar"
      >
        <button
          type="button"
          onClick={() => {
            if (isAutoTour) setIsAutoTour(false);
            prevRoom();
          }}
          aria-label="Ambiente anterior"
          className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 px-1">
          {pointsOfInterest.map((poi) => {
            const isSelected = currentRoom === poi.id;
            return (
              <div
                key={poi.id}
                className={`group relative flex items-center gap-2.5 pl-3.5 pr-2 py-2 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                    : 'bg-transparent hover:bg-white/5 border border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (isAutoTour) setIsAutoTour(false);
                    setCurrentRoom(poi.id);
                  }}
                  className="flex items-center gap-2.5 text-left"
                >
                  <span
                    className={`text-[11px] font-mono tracking-widest px-2 py-0.5 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-amber-200/20 text-amber-200 border border-amber-200/30'
                        : 'bg-white/5 text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  >
                    {poi.code}
                  </span>

                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap">
                      {poi.name}
                    </span>
                    <span className="text-[10px] text-zinc-400/80 hidden sm:flex items-center gap-1.5">
                      <Maximize className="w-2.5 h-2.5 text-amber-200/60" />
                      {poi.area} • PD {poi.ceilingHeight}
                    </span>
                  </div>
                </button>

                {/* Botão Discreto "+" de Especificações Arquitetônicas do Ponto de Interesse */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRoomSpecs(poi.id);
                  }}
                  title={`Abrir especificações arquitetônicas de ${poi.name}`}
                  aria-label={`Abrir especificações arquitetônicas de ${poi.name}`}
                  className={`w-6 h-6 rounded-xl flex items-center justify-center border text-xs font-medium transition-all ${
                    isSelected && isSpecsPanelOpen
                      ? 'bg-amber-300/30 border-amber-200/60 text-amber-100'
                      : 'bg-white/5 hover:bg-amber-200/20 border-white/10 hover:border-amber-200/40 text-zinc-400 hover:text-amber-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {isSelected && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            if (isAutoTour) setIsAutoTour(false);
            nextRoom();
          }}
          aria-label="Próximo ambiente"
          className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </footer>
  );
}
