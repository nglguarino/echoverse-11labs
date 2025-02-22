
import { create } from 'zustand';

interface Scene {
  id: number;
  background: string;
  character: {
    name: string;
    voiceId: string;
    dialogue: string;
    image: string;
  };
  choices: string[];
}

interface MovieState {
  genre: string | null;
  isGenerating: boolean;
  currentScene: Scene | null;
  sceneHistory: Scene[];
  storyBackground: string | null;
  setGenre: (genre: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentScene: (scene: Scene) => void;
  addToHistory: (scene: Scene) => void;
  setStoryBackground: (background: string) => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  genre: null,
  isGenerating: false,
  currentScene: null,
  sceneHistory: [],
  storyBackground: null,
  setGenre: (genre) => set({ genre }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  addToHistory: (scene) => set((state) => ({ 
    sceneHistory: [...state.sceneHistory, scene] 
  })),
  setStoryBackground: (background) => set({ storyBackground: background }),
}));
