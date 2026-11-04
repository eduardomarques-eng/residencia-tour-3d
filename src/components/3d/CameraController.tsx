'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import CameraControlsImpl from 'camera-controls';
import * as THREE from 'three';
import { useTourStore, RoomId, Vector3Tuple } from '@/store/useTourStore';

const EYE_HEIGHT = 1.65;
const TRANSITION_DURATION = 1.2;
const AUTO_TOUR_PAUSE_MS = 6000;

export interface RoomCameraConfig {
  id: RoomId;
  label: string;
  position: Vector3Tuple;
  target: Vector3Tuple;
  orbitPosition: Vector3Tuple;
  orbitTarget: Vector3Tuple;
  floorHotspot: Vector3Tuple;
}

export const ROOM_CAMERA_PRESETS: Record<RoomId, RoomCameraConfig> = {
  exterior: {
    id: 'exterior',
    label: 'Fachada',
    position: [0, 2, 12],
    target: [0, 1.5, 0],
    orbitPosition: [14, 9.5, 16],
    orbitTarget: [0, 1.5, 0],
    floorHotspot: [0, 0.18, 9.2],
  },
  living: {
    id: 'living',
    label: 'Living',
    position: [1.5, 1.6, 2],
    target: [3, 1.5, -1],
    orbitPosition: [11, 8.5, 11],
    orbitTarget: [2, 1.5, -1],
    floorHotspot: [1.5, 0.18, 2],
  },
  kitchen: {
    id: 'kitchen',
    label: 'Cozinha',
    position: [-2, 1.6, 1],
    target: [-2, 1.4, -3],
    orbitPosition: [-11, 8.5, 10],
    orbitTarget: [-2, 1.4, -2],
    floorHotspot: [-2, 0.18, 1],
  },
  suite: {
    id: 'suite',
    label: 'Suíte',
    position: [3, 1.6, -4],
    target: [1, 1.4, -4],
    orbitPosition: [12, 8.5, -9],
    orbitTarget: [2, 1.4, -4],
    floorHotspot: [3, 0.18, -4],
  },
  veranda: {
    id: 'veranda',
    label: 'Varanda Gourmet',
    position: [-3, 1.6, 5],
    target: [-1, 1.5, 2],
    orbitPosition: [-12, 8.0, 12],
    orbitTarget: [-2, 1.5, 3.5],
    floorHotspot: [-3, 0.18, 5],
  },
};

interface FloorHotspotMarkerProps {
  config: RoomCameraConfig;
  isActive: boolean;
  onSelect: (config: RoomCameraConfig) => void;
  onOpenSpecs: (roomId: RoomId) => void;
}

function FloorHotspotMarker({
  config,
  isActive,
  onSelect,
  onOpenSpecs,
}: FloorHotspotMarkerProps) {
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const outerMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!pulseRingRef.current || !outerMatRef.current) return;
    const t = clock.getElapsedTime();
    const phase = (t * 1.35 + config.position[0]) % 1;
    const scale = 1 + phase * 0.85;
    pulseRingRef.current.scale.set(scale, scale, 1);
    outerMatRef.current.opacity = (1 - phase) * (hovered ? 0.85 : 0.55);
  });

  return (
    <group position={config.floorHotspot}>
      {/* Disco de Toque / Clique no Piso */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(config);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial
          color={isActive ? '#fbbf24' : '#ffffff'}
          transparent
          opacity={hovered ? 0.35 : 0.18}
          depthWrite={false}
        />
      </mesh>

      {/* Anel Interno Nítido */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[0.22, 0.28, 32]} />
        <meshBasicMaterial
          color={isActive || hovered ? '#fcd34d' : '#f4f4f5'}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Ponto Central */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[0.08, 24]} />
        <meshBasicMaterial
          color={isActive ? '#fbbf24' : '#ffffff'}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>

      {/* Anel de Pulso Expansivo */}
      <mesh
        ref={pulseRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.002, 0]}
      >
        <ringGeometry args={[0.27, 0.33, 32]} />
        <meshBasicMaterial
          ref={outerMatRef}
          color="#fcd34d"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Etiqueta Flutuante com Botão Discreto "+" para Abrir Especificações Arquitetônicas */}
      <Html
        position={[0, 0.34, 0]}
        center
        distanceFactor={11}
        zIndexRange={[10, 0]}
      >
        <div
          className={`flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-[11px] font-medium tracking-wide backdrop-blur-md border transition-all duration-300 whitespace-nowrap select-none shadow-lg ${
            isActive
              ? 'bg-amber-300/25 border-amber-200/60 text-amber-100'
              : hovered
              ? 'bg-zinc-900/90 border-amber-200/50 text-white scale-105'
              : 'bg-zinc-950/75 border-white/15 text-zinc-200 hover:text-white'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(config);
            }}
            className="pr-1"
          >
            {config.label}
          </button>
          <button
            type="button"
            title={`Ver especificações de ${config.label}`}
            aria-label={`Ver especificações de ${config.label}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenSpecs(config.id);
            }}
            className="w-5 h-5 rounded-full bg-white/10 hover:bg-amber-300/35 border border-white/20 hover:border-amber-200 flex items-center justify-center text-amber-200 hover:text-white font-semibold text-xs leading-none transition-colors"
          >
            +
          </button>
        </div>
      </Html>
    </group>
  );
}

export function CameraController() {
  const controlsRef = useRef<CameraControlsImpl>(null);
  const { camera } = useThree();
  const {
    currentRoom,
    setCurrentRoom,
    navigationMode,
    showHotspots,
    isTransitioning,
    setIsTransitioning,
    isAutoTour,
    setIsAutoTour,
    nextRoom,
    openRoomSpecs,
  } = useTourStore();

  const keysPressed = useRef<Record<string, boolean>>({});
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Listeners de teclado para locomoção WASD / Setas no Desktop (modo 'walk')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const moveCameraToLookAt = useCallback(
    (
      pos: Vector3Tuple,
      target: Vector3Tuple,
      mode: 'walk' | 'orbit',
      animate = true
    ) => {
      const controls = controlsRef.current;
      if (!controls) return;

      controls.smoothTime = TRANSITION_DURATION;

      if (mode === 'walk') {
        const startVec = new THREE.Vector3(pos[0], pos[1], pos[2]);
        const targetVec = new THREE.Vector3(target[0], target[1], target[2]);
        const lookDir = targetVec.clone().sub(startVec).normalize();
        const nearTarget = startVec.clone().add(lookDir.multiplyScalar(0.25));

        setIsTransitioning(true);
        void controls
          .setLookAt(
            startVec.x,
            startVec.y,
            startVec.z,
            nearTarget.x,
            nearTarget.y,
            nearTarget.z,
            animate
          )
          .finally(() => {
            setIsTransitioning(false);
          });
      } else {
        setIsTransitioning(true);
        void controls
          .setLookAt(
            pos[0],
            pos[1],
            pos[2],
            target[0],
            target[1],
            target[2],
            animate
          )
          .finally(() => {
            setIsTransitioning(false);
          });
      }
    },
    [setIsTransitioning]
  );

  // Configuração dos botões de Mouse (Desktop) e Gestos Touch (Mobile)
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.smoothTime = TRANSITION_DURATION;
    controls.draggingSmoothTime = 0.12;

    if (navigationMode === 'walk') {
      controls.mouseButtons.left = CameraControlsImpl.ACTION.ROTATE;
      controls.mouseButtons.right = CameraControlsImpl.ACTION.NONE;
      controls.mouseButtons.middle = CameraControlsImpl.ACTION.DOLLY;
      controls.mouseButtons.wheel = CameraControlsImpl.ACTION.ZOOM;

      controls.touches.one = CameraControlsImpl.ACTION.TOUCH_ROTATE;
      controls.touches.two = CameraControlsImpl.ACTION.TOUCH_ZOOM;
      controls.touches.three = CameraControlsImpl.ACTION.NONE;

      controls.minZoom = 0.75;
      controls.maxZoom = 2.2;
      controls.minDistance = 0.05;
      controls.maxDistance = 2.5;
      controls.minPolarAngle = Math.PI * 0.22;
      controls.maxPolarAngle = Math.PI * 0.78;
      controls.azimuthRotateSpeed = -0.55;
      controls.polarRotateSpeed = -0.45;
    } else {
      controls.mouseButtons.left = CameraControlsImpl.ACTION.ROTATE;
      controls.mouseButtons.right = CameraControlsImpl.ACTION.TRUCK;
      controls.mouseButtons.middle = CameraControlsImpl.ACTION.DOLLY;
      controls.mouseButtons.wheel = CameraControlsImpl.ACTION.DOLLY;

      controls.touches.one = CameraControlsImpl.ACTION.TOUCH_ROTATE;
      controls.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY_TRUCK;
      controls.touches.three = CameraControlsImpl.ACTION.TOUCH_TRUCK;

      controls.zoomTo(1, true);
      controls.minDistance = 3.5;
      controls.maxDistance = 38;
      controls.minPolarAngle = 0.12;
      controls.maxPolarAngle = Math.PI / 2 - 0.04;
      controls.azimuthRotateSpeed = 0.85;
      controls.polarRotateSpeed = 0.85;
    }
  }, [navigationMode]);

  // Transição automática de câmera ao trocar de cômodo ou modo na UI
  useEffect(() => {
    const preset =
      ROOM_CAMERA_PRESETS[currentRoom] || ROOM_CAMERA_PRESETS.living;

    if (navigationMode === 'walk') {
      moveCameraToLookAt(preset.position, preset.target, 'walk', true);
    } else {
      moveCameraToLookAt(
        preset.orbitPosition,
        preset.orbitTarget,
        'orbit',
        true
      );
    }
  }, [currentRoom, navigationMode, moveCameraToLookAt]);

  // Temporizador do Modo Auto-Tour: pausa 6 segundos em cada cômodo antes de avançar na sequência
  useEffect(() => {
    if (!isAutoTour) return;

    const timer = setTimeout(() => {
      nextRoom();
    }, AUTO_TOUR_PAUSE_MS + TRANSITION_DURATION * 1000);

    return () => clearTimeout(timer);
  }, [isAutoTour, currentRoom, nextRoom]);

  // Locomoção WASD + Leve Rotação Panorâmica durante os 6s de pausa do Modo Auto-Tour
  useFrame(({ clock }, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Se o Modo Auto-Tour está ativo e a transição entre salas já concluiu, realiza leve rotação panorâmica
    if (isAutoTour && !isTransitioning) {
      const swayDir = Math.sin(clock.getElapsedTime() * 0.45) >= 0 ? 1 : -1;
      void controls.rotate(delta * 0.09 * swayDir, 0, false);
    }

    if (navigationMode !== 'walk') return;

    const moveSpeed = 3.4 * delta;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3()
      .crossVectors(forward, camera.up)
      .normalize();

    const moveOffset = new THREE.Vector3();

    if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) {
      moveOffset.add(forward);
    }
    if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) {
      moveOffset.sub(forward);
    }
    if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) {
      moveOffset.add(right);
    }
    if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) {
      moveOffset.sub(right);
    }

    if (moveOffset.lengthSq() > 0) {
      if (isAutoTour) setIsAutoTour(false);
      moveOffset.normalize().multiplyScalar(moveSpeed);

      const currentPos = new THREE.Vector3();
      const currentTarget = new THREE.Vector3();
      controls.getPosition(currentPos);
      controls.getTarget(currentTarget);

      const lookDelta = currentTarget.clone().sub(currentPos);
      const nextPos = new THREE.Vector3(
        THREE.MathUtils.clamp(currentPos.x + moveOffset.x, -6.2, 6.2),
        EYE_HEIGHT,
        THREE.MathUtils.clamp(currentPos.z + moveOffset.z, -4.4, 12.5)
      );
      const nextTarget = nextPos.clone().add(lookDelta);

      void controls.setLookAt(
        nextPos.x,
        nextPos.y,
        nextPos.z,
        nextTarget.x,
        nextTarget.y,
        nextTarget.z,
        false
      );
    }
  });

  const handleFloorPointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleFloorClick = (e: ThreeEvent<MouseEvent>) => {
    if (navigationMode !== 'walk') return;

    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    if (Math.hypot(dx, dy) > 6) return;

    const controls = controlsRef.current;
    if (!controls) return;

    if (isAutoTour) setIsAutoTour(false);

    const hitPoint = e.point;
    const currentPos = new THREE.Vector3();
    controls.getPosition(currentPos);

    const walkDir = new THREE.Vector3(
      hitPoint.x - currentPos.x,
      0,
      hitPoint.z - currentPos.z
    );
    if (walkDir.lengthSq() < 0.05) {
      camera.getWorldDirection(walkDir);
      walkDir.y = 0;
    }
    walkDir.normalize();

    const destPos: Vector3Tuple = [
      THREE.MathUtils.clamp(hitPoint.x, -6.0, 6.0),
      EYE_HEIGHT,
      THREE.MathUtils.clamp(hitPoint.z, -4.3, 12.0),
    ];
    const destTarget: Vector3Tuple = [
      destPos[0] + walkDir.x * 2.0,
      EYE_HEIGHT - 0.08,
      destPos[2] + walkDir.z * 2.0,
    ];

    moveCameraToLookAt(destPos, destTarget, 'walk', true);
  };

  const handleHotspotSelect = (config: RoomCameraConfig) => {
    if (isAutoTour) setIsAutoTour(false);
    if (config.id === currentRoom && navigationMode === 'walk') {
      moveCameraToLookAt(config.position, config.target, 'walk', true);
    } else {
      setCurrentRoom(config.id);
    }
  };

  return (
    <>
      <CameraControls
        ref={controlsRef}
        makeDefault
        smoothTime={TRANSITION_DURATION}
        draggingSmoothTime={0.12}
      />

      {/* Plano Invisível de Caminhada por Toque no Piso */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.17, 2.0]}
        onPointerDown={handleFloorPointerDown}
        onClick={handleFloorClick}
        visible={false}
      >
        <planeGeometry args={[14.5, 16.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Marcadores Circulares 3D no Piso com Pulso Sutil + Botão "+" de Especificações */}
      {showHotspots && (
        <group name="FloorHotspotsGroup">
          {Object.values(ROOM_CAMERA_PRESETS).map((config) => (
            <FloorHotspotMarker
              key={config.id}
              config={config}
              isActive={currentRoom === config.id}
              onSelect={handleHotspotSelect}
              onOpenSpecs={openRoomSpecs}
            />
          ))}
        </group>
      )}
    </>
  );
}
