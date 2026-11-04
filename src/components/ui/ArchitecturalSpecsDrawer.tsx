'use client';

import React from 'react';
import {
  X,
  Maximize2,
  ArrowUpDown,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useTourStore } from '@/store/useTourStore';

export function ArchitecturalSpecsDrawer() {
  const {
    isSpecsPanelOpen,
    setIsSpecsPanelOpen,
    getCurrentPOI,
    pointsOfInterest,
    currentRoom,
    setCurrentRoom,
  } = useTourStore();

  const poi = getCurrentPOI();

  return (
    <aside
      aria-label="Especificações Arquitetônicas do Ambiente"
      className={`fixed top-20 bottom-28 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[400px] transition-all duration-500 ease-out ${
        isSpecsPanelOpen
          ? 'translate-x-0 opacity-100 pointer-events-auto'
          : 'translate-x-8 opacity-0 pointer-events-none'
      }`}
    >
      <div className="h-full flex flex-col justify-between bg-zinc-950/75 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.75)] overflow-y-auto no-scrollbar">
        {/* Cabeçalho do Painel Lateral */}
        <div>
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-amber-200/85 font-medium mb-1">
                <span>Memorial Descritivo // {poi.code}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-light tracking-wide text-white">
                {poi.name}
              </h2>
              <p className="text-xs text-zinc-400 font-light mt-0.5">
                {poi.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSpecsPanelOpen(false)}
              aria-label="Fechar painel de especificações"
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Metragem do Ambiente e Pé-Direito */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                <Maximize2 className="w-3 h-3 text-amber-200/80" />
                <span>Metragem Útil</span>
              </div>
              <span className="text-lg font-medium text-white tracking-wide">
                {poi.area}
              </span>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                <ArrowUpDown className="w-3 h-3 text-amber-200/80" />
                <span>Pé-Direito Livre</span>
              </div>
              <span className="text-lg font-medium text-white tracking-wide">
                {poi.ceilingHeight}
              </span>
            </div>
          </div>

          {/* 2. Conceito de Iluminação */}
          <div className="mb-4 bg-gradient-to-br from-amber-200/[0.07] via-white/[0.02] to-transparent border border-amber-200/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-amber-200 font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conceito de Iluminação</span>
            </div>
            <p className="text-xs text-zinc-200/90 leading-relaxed font-light">
              {poi.lightingConcept}
            </p>
          </div>

          {/* 3. Acabamentos Previstos no Projeto */}
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-300 font-medium mb-2.5">
              <Layers className="w-3.5 h-3.5 text-amber-200/80" />
              <span>Acabamentos Previstos</span>
            </div>

            <div className="space-y-2">
              {poi.finishes.map((item) => (
                <div
                  key={item.category}
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300/80 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-400">
                      {item.category}
                    </span>
                    <span className="text-xs text-zinc-100 font-light">
                      {item.specification}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé do Painel: Seletor Rápido de Cômodos */}
        <div className="pt-4 mt-4 border-t border-white/10">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
            Alternar Ficha de Ambiente
          </span>
          <div className="flex flex-wrap gap-1.5">
            {pointsOfInterest.map((item) => {
              const active = item.id === currentRoom;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentRoom(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                    active
                      ? 'bg-amber-200/20 border border-amber-200/40 text-amber-100 font-medium'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {item.code} • {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
