import { create } from 'zustand';

export type RoomId = 'exterior' | 'living' | 'kitchen' | 'suite' | 'veranda';
export type NavigationMode = 'walk' | 'orbit';
export type QualityPreset = 'ultra' | 'balanced';
export type TimeOfDay = 'day' | 'sunset' | 'night';

export type Vector3Tuple = [number, number, number];

export interface PointOfInterest {
  id: RoomId;
  code: string;
  name: string;
  subtitle: string;
  area: string;
  ceilingHeight: string;
  materials: string[];
  description: string;
  position: Vector3Tuple;
  target: Vector3Tuple;
  orbitPosition: Vector3Tuple;
  orbitTarget: Vector3Tuple;
  hotspotPosition: Vector3Tuple;
}

export const ROOM_CAMERAS: Record<
  RoomId,
  { position: Vector3Tuple; target: Vector3Tuple }
> = {
  exterior: { position: [0, 2, 12], target: [0, 1.5, 0] },
  living: { position: [1.5, 1.6, 2], target: [3, 1.5, -1] },
  kitchen: { position: [-2, 1.6, 1], target: [-2, 1.4, -3] },
  suite: { position: [3, 1.6, -4], target: [1, 1.4, -4] },
  veranda: { position: [-3, 1.6, 5], target: [-1, 1.5, 2] },
};

export const POINTS_OF_INTEREST: PointOfInterest[] = [
  {
    id: 'exterior',
    code: '01',
    name: 'Fachada',
    subtitle: 'Espelho d’água, borda infinita e deck em Cumaru',
    area: '145 m²',
    ceilingHeight: 'Livre',
    materials: ['Deck Cumaru', 'Pedra Hijau', 'Concreto Ripado'],
    description:
      'Perspectiva externa valorizando os volumes em balanço da arquitetura autoral, piscina com borda infinita aquecida e lounge externo.',
    position: [0, 2, 12],
    target: [0, 1.5, 0],
    orbitPosition: [14, 9.5, 16],
    orbitTarget: [0, 1.5, 0],
    hotspotPosition: [0, 0.18, 8.5],
  },
  {
    id: 'living',
    code: '02',
    name: 'Living',
    subtitle: 'Pé-direito duplo com iluminação zenital e lareira',
    area: '68 m²',
    ceilingHeight: '5.40 m',
    materials: ['Concreto Aparente', 'Travertino Romano', 'Freijó Natural'],
    description:
      'Estar social amplo com esquadrias minimalistas piso-teto, claraboia zenital e lareira linear em pedra sinterizada.',
    position: [1.5, 1.6, 2],
    target: [3, 1.5, -1],
    orbitPosition: [11, 8.5, 11],
    orbitTarget: [2, 1.5, -1],
    hotspotPosition: [1.5, 0.18, 2],
  },
  {
    id: 'kitchen',
    code: '03',
    name: 'Cozinha',
    subtitle: 'Ilha monolítica e marcenaria em nogueira',
    area: '42 m²',
    ceilingHeight: '3.20 m',
    materials: ['Quartzito Taj Mahal', 'Nogueira Americana', 'Aço Escovado'],
    description:
      'Ilha central esculpida em bloco único com luminárias lineares suspensas, adega climatizada e integração direta com o jantar.',
    position: [-2, 1.6, 1],
    target: [-2, 1.4, -3],
    orbitPosition: [-11, 8.5, 10],
    orbitTarget: [-2, 1.4, -2],
    hotspotPosition: [-2, 0.18, 1],
  },
  {
    id: 'suite',
    code: '04',
    name: 'Suíte',
    subtitle: 'Refúgio privativo com cabeceira ripada e brises',
    area: '54 m²',
    ceilingHeight: '3.20 m',
    materials: ['Carvalho Europeu', 'Linho Belga', 'Brise Metálico'],
    description:
      'Suíte master integrada com cabeceira ripada iluminada, vidro piso-teto e brises metálicos de controle solar.',
    position: [3, 1.6, -4],
    target: [1, 1.4, -4],
    orbitPosition: [12, 8.5, -9],
    orbitTarget: [2, 1.4, -4],
    hotspotPosition: [3, 0.18, -4],
  },
  {
    id: 'veranda',
    code: '05',
    name: 'Varanda Gourmet',
    subtitle: 'Lounge coberto integrado ao deck e piscina',
    area: '38 m²',
    ceilingHeight: '3.40 m',
    materials: ['Cumaru Natural', 'Granito Escovado', 'Alumínio Anodizado'],
    description:
      'Terraço gourmet coberto em balanço conectando a cozinha e o living diretamente à piscina e ao espelho d’água.',
    position: [-3, 1.6, 5],
    target: [-1, 1.5, 2],
    orbitPosition: [-12, 8.0, 12],
    orbitTarget: [-2, 1.5, 3.5],
    hotspotPosition: [-3, 0.18, 5],
  },
];

interface TourState {
  currentRoom: RoomId;
  navigationMode: NavigationMode;
  qualityPreset: QualityPreset;
  timeOfDay: TimeOfDay;
  pointsOfInterest: PointOfInterest[];
  isTransitioning: boolean;
  showHotspots: boolean;
  isSceneReady: boolean;

  // Actions
  setCurrentRoom: (room: RoomId) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setQualityPreset: (preset: QualityPreset) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
  setShowHotspots: (show: boolean) => void;
  setIsSceneReady: (ready: boolean) => void;
  nextRoom: () => void;
  prevRoom: () => void;
  getCurrentPOI: () => PointOfInterest;
}

export const useTourStore = create<TourState>((set, get) => ({
  currentRoom: 'living',
  navigationMode: 'walk',
  qualityPreset: 'ultra',
  timeOfDay: 'sunset',
  pointsOfInterest: POINTS_OF_INTEREST,
  isTransitioning: false,
  showHotspots: true,
  isSceneReady: false,

  setCurrentRoom: (room) =>
    set({
      currentRoom: room,
    }),

  setNavigationMode: (mode) =>
    set({
      navigationMode: mode,
    }),

  setQualityPreset: (preset) =>
    set({
      qualityPreset: preset,
    }),

  setTimeOfDay: (time) =>
    set({
      timeOfDay: time,
    }),

  setIsTransitioning: (isTransitioning) =>
    set({
      isTransitioning,
    }),

  setShowHotspots: (show) =>
    set({
      showHotspots: show,
    }),

  setIsSceneReady: (ready) =>
    set({
      isSceneReady: ready,
    }),

  nextRoom: () => {
    const { pointsOfInterest, currentRoom } = get();
    const currentIndex = pointsOfInterest.findIndex((p) => p.id === currentRoom);
    const nextIndex = (currentIndex + 1) % pointsOfInterest.length;
    set({ currentRoom: pointsOfInterest[nextIndex].id });
  },

  prevRoom: () => {
    const { pointsOfInterest, currentRoom } = get();
    const currentIndex = pointsOfInterest.findIndex((p) => p.id === currentRoom);
    const prevIndex =
      (currentIndex - 1 + pointsOfInterest.length) % pointsOfInterest.length;
    set({ currentRoom: pointsOfInterest[prevIndex].id });
  },

  getCurrentPOI: () => {
    const { pointsOfInterest, currentRoom } = get();
    return (
      pointsOfInterest.find((p) => p.id === currentRoom) || pointsOfInterest[0]
    );
  },
}));
