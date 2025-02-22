
import { create } from 'zustand';

interface MovieState {
  genre: string | null;
  isGenerating: boolean;
  currentScene: number;
  setGenre: (genre: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentScene: (scene: number) => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  genre: null,
  isGenerating: false,
  currentScene: 0,
  setGenre: (genre) => set({ genre }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentScene: (currentScene) => set({ currentScene }),
}));
