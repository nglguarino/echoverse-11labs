
import { create } from 'zustand';

export interface Character {
  id: string;
  name: string;
  voiceId: string;
  image: string;
  gender: 'male' | 'female';
  dialogue: string[];
  knowledge: Record<string, boolean>;
}

export interface Scene {
  id: number;
  background: string;
  description: string;
  characters: Character[];
  choices: string[];
  ambience?: string;
  isGameOver?: boolean;
}

interface PlotState {
  currentScene: Scene | null;
  sceneHistory: Scene[];
  transcript: string[];
  isGenerating: boolean;
  isGameOver: boolean;
  genre: string | null;
  setGenre: (genre: string) => void;
  setCurrentScene: (scene: Scene) => void;
  addToHistory: (scene: Scene) => void;
  addToTranscript: (text: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGameOver: (isGameOver: boolean) => void;
}

export const usePlotStore = create<PlotState>((set) => ({
  currentScene: null,
  sceneHistory: [],
  transcript: [],
  isGenerating: false,
  isGameOver: false,
  genre: null,
  setGenre: (genre) => set({ genre }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  addToHistory: (scene) => set((state) => ({ 
    sceneHistory: [...state.sceneHistory, scene] 
  })),
  addToTranscript: (text) => set((state) => ({
    transcript: [...state.transcript, text]
  })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGameOver: (isGameOver) => set({ isGameOver }),
}));
