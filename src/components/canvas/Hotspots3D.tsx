'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useTourStore } from '@/store/useTourStore';

export function Hotspots3D() {
  const {
    pointsOfInterest,
    currentRoom,
    setCurrentRoom,
    showHotspots,
    navigationMode,
  } = useTourStore();

  if (!showHotspots) return null;

  return (
    <group>
      {pointsOfInterest.map((poi) => {
        const isCurrent = currentRoom === poi.id;
        // No modo Passeio (1ª Pessoa), oculta o marcador do próprio ambiente em que o usuário já está
        if (navigationMode === 'walk' && isCurrent) return null;

        return (
          <Html
            key={poi.id}
            position={poi.hotspotPosition}
            center
            distanceFactor={14}
            zIndexRange={[10, 0]}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRoom(poi.id);
              }}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 whitespace-nowrap select-none shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
                isCurrent
                  ? 'bg-amber-300/25 border-amber-200/60 text-white scale-105'
                  : 'bg-zinc-950/75 border-white/15 text-zinc-200 hover:bg-zinc-900/90 hover:border-amber-200/40 hover:scale-105'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isCurrent ? 'bg-amber-300' : 'bg-amber-200/60'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isCurrent ? 'bg-amber-300' : 'bg-amber-200'
                  }`}
                />
              </span>
              <span className="text-[10px] font-mono text-amber-200/90">
                {poi.code}
              </span>
              <span className="text-xs font-medium tracking-wide">
                {poi.name}
              </span>
            </button>
          </Html>
        );
      })}
    </group>
  );
}

