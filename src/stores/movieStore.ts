import { create } from 'zustand';

export interface Scene {
  id: number;
  background: string;
  character: {
    name: string;
    voiceId: string;
    dialogue: string;
    image: string;
    gender: 'male' | 'female';
  };
  choices: string[];
}

export type StoryEnding = {
  type: 'success' | 'game-over';
  message: string;
  achievement?: string;
}

interface MovieState {
  genre: string | null;
  isGenerating: boolean;
  currentScene: Scene | null;
  sceneHistory: Scene[];
  storyBackground: string | null;
  storyEnding: StoryEnding | null;
  hasShownEnding: boolean;
  storyCharacter: {
    name: string;
    image: string;
    gender: 'male' | 'female';
  } | null;
  setGenre: (genre: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentScene: (scene: Scene) => void;
  addToHistory: (scene: Scene) => void;
  setStoryBackground: (background: string) => void;
  setStoryCharacter: (character: { name: string; image: string; gender: 'male' | 'female' }) => void;
  setStoryEnding: (ending: StoryEnding) => void;
  resetStoryEnding: () => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  genre: null,
  isGenerating: false,
  currentScene: null,
  sceneHistory: [],
  storyBackground: null,
  storyEnding: null,
  hasShownEnding: false,
  storyCharacter: null,
  setGenre: (genre) => set({ genre }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  addToHistory: (scene) => set((state) => ({ 
    sceneHistory: [...state.sceneHistory, scene] 
  })),
  setStoryBackground: (background) => set({ storyBackground: background }),
  setStoryCharacter: (character) => set({ storyCharacter: character }),
  setStoryEnding: (ending) => set((state) => ({ 
    storyEnding: ending,
    hasShownEnding: true 
  })),
  resetStoryEnding: () => set({ 
    storyEnding: null,
    hasShownEnding: true
  }),
}));
