
import { create } from 'zustand';

export interface Character {
  id: string;
  name: string;
  image: string;
  personality: string;
  knowledge: {
    [key: string]: boolean | string; // What the character knows
  };
  relationships: {
    [characterId: string]: {
      type: 'friend' | 'enemy' | 'neutral' | 'romantic';
      level: number; // -10 to 10
    };
  };
  stats: {
    health: number;
    mood: number;
    trust: number;
  };
}

export interface PlotEvent {
  type: 'dialogue' | 'action' | 'decision';
  content: string;
  consequence: string;
  severity: number; // 1-10
  timestamp: number;
}

interface PlotSupervisorState {
  characters: { [id: string]: Character };
  plotEvents: PlotEvent[];
  tension: number; // 0-100
  storyPhase: 'introduction' | 'rising_action' | 'climax' | 'falling_action' | 'resolution';
  currentThemes: string[];
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  addPlotEvent: (event: PlotEvent) => void;
  setTension: (tension: number) => void;
  setStoryPhase: (phase: typeof PlotSupervisorState.prototype.storyPhase) => void;
  setCurrentThemes: (themes: string[]) => void;
}

export const usePlotSupervisorStore = create<PlotSupervisorState>((set, get) => ({
  characters: {},
  plotEvents: [],
  tension: 0,
  storyPhase: 'introduction',
  currentThemes: [],
  
  addCharacter: (character) => set((state) => ({
    characters: { ...state.characters, [character.id]: character }
  })),
  
  updateCharacter: (id, updates) => set((state) => ({
    characters: {
      ...state.characters,
      [id]: { ...state.characters[id], ...updates }
    }
  })),
  
  addPlotEvent: (event) => set((state) => ({
    plotEvents: [...state.plotEvents, event],
    tension: Math.min(100, state.tension + event.severity)
  })),
  
  setTension: (tension) => set({ tension }),
  setStoryPhase: (phase) => set({ storyPhase: phase }),
  setCurrentThemes: (themes) => set({ currentThemes: themes })
}));
