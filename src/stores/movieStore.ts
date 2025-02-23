
import { create } from 'zustand';

export interface Character {
  name: string;
  image: string;
  gender: 'male' | 'female';
  voiceId?: string;
}

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
  otherCharacters?: Array<{
    name: string;
    voiceId: string;
    dialogue: string;
    image: string;
    gender: 'male' | 'female';
  }>;
  choices: string[];
}

interface MovieState {
  genre: string | null;
  isGenerating: boolean;
  currentScene: Scene | null;
  sceneHistory: Scene[];
  storyBackground: string | null;
  storyCharacter: Character | null;
  storyCharacters: Character[];
  setGenre: (genre: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentScene: (scene: Scene) => void;
  addToHistory: (scene: Scene) => void;
  setStoryBackground: (background: string) => void;
  setStoryCharacter: (character: Character) => void;
  addStoryCharacter: (character: Character) => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  genre: null,
  isGenerating: false,
  currentScene: null,
  sceneHistory: [],
  storyBackground: null,
  storyCharacter: null,
  storyCharacters: [],
  setGenre: (genre) => set({ genre }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  addToHistory: (scene) => set((state) => ({ 
    sceneHistory: [...state.sceneHistory, scene] 
  })),
  setStoryBackground: (background) => set({ storyBackground: background }),
  setStoryCharacter: (character) => set({ storyCharacter: character }),
  addStoryCharacter: (character) => set((state) => ({
    storyCharacters: [...state.storyCharacters, character]
  })),
}));
