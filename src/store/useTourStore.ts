import { create } from 'zustand';

export type RoomId = 'exterior' | 'living' | 'kitchen' | 'suite' | 'veranda';
export type NavigationMode = 'walk' | 'orbit';
export type QualityPreset = 'ultra' | 'balanced';
export type TimeOfDay = 'day' | 'sunset' | 'night';

export type Vector3Tuple = [number, number, number];

export interface FinishSpec {
  category: string;
  specification: string;
}

export interface PointOfInterest {
  id: RoomId;
  code: string;
  name: string;
  subtitle: string;
  area: string;
  ceilingHeight: string;
  materials: string[];
  lightingConcept: string;
  finishes: FinishSpec[];
  description: string;
  position: Vector3Tuple;
  target: Vector3Tuple;
  orbitPosition: Vector3Tuple;
  orbitTarget: Vector3Tuple;
  hotspotPosition: Vector3Tuple;
}

export const AUTO_TOUR_SEQUENCE: RoomId[] = [
  'exterior',
  'living',
  'kitchen',
  'suite',
  'veranda',
];

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
    lightingConcept:
      'Sanca linear periférica em LED 2700K valorizando os volumes em balanço, combinada a arandelas de duplo facho nos pilares e iluminação subaquática 4000K na borda infinita.',
    finishes: [
      { category: 'Piso Externo', specification: 'Placas drenantes em Concreto Arquitetônico + Deck Cumaru' },
      { category: 'Revestimento Piscina', specification: 'Pedra Natural Hijau Bruta 20x20 cm' },
      { category: 'Alvenaria & Fachada', specification: 'Concreto Aparente Ripado Hidrofugado e Reboco Mineral Off-White' },
      { category: 'Esquadrias', specification: 'Alumínio Anodizado Preto Minimalista com Vidro Duplo Solar' },
    ],
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
    lightingConcept:
      'Claraboia zenital com brises de controle solar para luz natural difusa durante o dia e perfis lineares No-Frame 2700K Dimerizáveis integrados ao forro e ao painel ripado à noite.',
    finishes: [
      { category: 'Piso Social', specification: 'Placas de Concreto Polido 120x120 cm com acabamento acetinado' },
      { category: 'Painel Arquitetônico', specification: 'Ripado 3D em Madeira Freijó Natural Catedral' },
      { category: 'Lareira & Bancada', specification: 'Lâmina Ultracompacta Sinterizada Nero Marquina Fosco' },
      { category: 'Caixilharia', specification: 'Sistema Minimalista Piso-Teto com Vidro Laminado Extra Clear' },
    ],
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
    lightingConcept:
      'Luminária pendente linear suspensa com facho direto/indireto 3000K CRI > 95 sobre a ilha monolítica e fita de LED contínua embutida na cava da marcenaria superior.',
    finishes: [
      { category: 'Ilha & Bancadas', specification: 'Quartzito Natural Taj Mahal Escovado com meia-esquadria' },
      { category: 'Marcenaria', specification: 'Folha Natural de Nogueira Americana + Laca Acetinada Grafite' },
      { category: 'Metais & Cuba', specification: 'Aço Inox PVD Gunmetal Escovado' },
      { category: 'Piso', specification: 'Placas Monolíticas em Concreto Polido de Alta Resistência' },
    ],
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
    lightingConcept:
      'Iluminação cênica indireta 2400K ultra-quente na sanca da cabeceira ripada, promovendo conforto circadiano e relaxamento sem ofuscamento direto.',
    finishes: [
      { category: 'Piso Íntimo', specification: 'Tábuas Corridas em Carvalho Europeu Escovado' },
      { category: 'Cabeceira & Painéis', specification: 'Freijó Natural Ripado + Estofamento em Linho Belga Cru' },
      { category: 'Controle Solar', specification: 'Brises Verticais Pivotantes em Alumínio Amadeirado' },
      { category: 'Paredes', specification: 'Pintura Mineral Acetinada Tom Areia Quente' },
    ],
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
    lightingConcept:
      'Perfis embutidos recuados no forro com proteção IP65 e arandelas arquitetônicas lavando os painéis ripados com luz âmbar 2700K no período noturno.',
    finishes: [
      { category: 'Piso Terraço', specification: 'Concreto Travertino Antiderrapante + Deck em Cumaru' },
      { category: 'Bancada Gourmet', specification: 'Granito São Gabriel Escovado (Leather Finish)' },
      { category: 'Mobiliário Fixo', specification: 'Madeira Maciça Cumaru Certificada e Alumínio Naval' },
      { category: 'Forro', specification: 'Gesso Estruturado Hidrófugo com Tabica Metálica Preta' },
    ],
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
  adaptiveDpr: number;
  currentFps: number;
  timeOfDay: TimeOfDay;
  pointsOfInterest: PointOfInterest[];
  isTransitioning: boolean;
  showHotspots: boolean;
  isSceneReady: boolean;
  isAutoTour: boolean;
  isSpecsPanelOpen: boolean;

  // Actions
  setCurrentRoom: (room: RoomId) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setQualityPreset: (preset: QualityPreset) => void;
  setAdaptivePerformance: (dpr: number, preset: QualityPreset, fps?: number) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
  setShowHotspots: (show: boolean) => void;
  setIsSceneReady: (ready: boolean) => void;
  setIsAutoTour: (active: boolean) => void;
  toggleAutoTour: () => void;
  setIsSpecsPanelOpen: (open: boolean) => void;
  openRoomSpecs: (room: RoomId) => void;
  nextRoom: () => void;
  prevRoom: () => void;
  getCurrentPOI: () => PointOfInterest;
}

export const useTourStore = create<TourState>((set, get) => ({
  currentRoom: 'living',
  navigationMode: 'walk',
  qualityPreset: 'ultra',
  adaptiveDpr: 2,
  currentFps: 60,
  timeOfDay: 'sunset',
  pointsOfInterest: POINTS_OF_INTEREST,
  isTransitioning: false,
  showHotspots: true,
  isSceneReady: false,
  isAutoTour: false,
  isSpecsPanelOpen: false,

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
      adaptiveDpr: preset === 'ultra' ? 2 : 1,
    }),

  setAdaptivePerformance: (dpr, preset, fps) =>
    set((state) => ({
      adaptiveDpr: dpr,
      qualityPreset: preset,
      currentFps: fps ?? state.currentFps,
    })),

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

  setIsAutoTour: (active) =>
    set((state) => ({
      isAutoTour: active,
      // Ao iniciar o Passeio Guiado, garante o modo 1ª pessoa imersivo e começa pela sequência
      navigationMode: active ? 'walk' : state.navigationMode,
    })),

  toggleAutoTour: () =>
    set((state) => {
      const nextActive = !state.isAutoTour;
      return {
        isAutoTour: nextActive,
        navigationMode: nextActive ? 'walk' : state.navigationMode,
        currentRoom: nextActive ? 'exterior' : state.currentRoom,
      };
    }),

  setIsSpecsPanelOpen: (open) =>
    set({
      isSpecsPanelOpen: open,
    }),

  openRoomSpecs: (room) =>
    set({
      currentRoom: room,
      isSpecsPanelOpen: true,
    }),

  nextRoom: () => {
    const { currentRoom } = get();
    const currentIndex = AUTO_TOUR_SEQUENCE.indexOf(currentRoom);
    const nextIndex = (currentIndex + 1) % AUTO_TOUR_SEQUENCE.length;
    set({ currentRoom: AUTO_TOUR_SEQUENCE[nextIndex] });
  },

  prevRoom: () => {
    const { currentRoom } = get();
    const currentIndex = AUTO_TOUR_SEQUENCE.indexOf(currentRoom);
    const prevIndex =
      (currentIndex - 1 + AUTO_TOUR_SEQUENCE.length) %
      AUTO_TOUR_SEQUENCE.length;
    set({ currentRoom: AUTO_TOUR_SEQUENCE[prevIndex] });
  },

  getCurrentPOI: () => {
    const { pointsOfInterest, currentRoom } = get();
    return (
      pointsOfInterest.find((p) => p.id === currentRoom) || pointsOfInterest[0]
    );
  },
}));
