
import { create } from 'zustand';

export interface Scene {
  id: number;
  background: string;
  characters: Array<{
    id: string;
    name: string;
    image: string;
    voiceId?: string;
    gender: 'male' | 'female';
    currentDialogue?: string;
  }>;
  activeCharacterId?: string; // Track who is currently speaking
  choices: string[];
  isComplete: boolean; // Track if all characters have spoken
}

interface MovieState {
  genre: string | null;
  isGenerating: boolean;
  currentScene: Scene | null;
  sceneHistory: Scene[];
  storyBackground: string | null;
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
  advanceDialogue: () => void;
}

export const useMovieStore = create<MovieState>((set, get) => ({
  genre: null,
  isGenerating: false,
  currentScene: null,
  sceneHistory: [],
  storyBackground: null,
  storyCharacter: null,
  setGenre: (genre) => set({ genre }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  addToHistory: (scene) => set((state) => ({ 
    sceneHistory: [...state.sceneHistory, scene] 
  })),
  setStoryBackground: (background) => set({ storyBackground: background }),
  setStoryCharacter: (character) => set({ storyCharacter: character }),
  advanceDialogue: () => set((state) => {
    if (!state.currentScene) return state;

    const currentScene = state.currentScene;
    const characters = currentScene.characters;

    // Find current speaking character index
    const currentSpeakerIndex = characters.findIndex(char => char.id === currentScene.activeCharacterId);
    
    // Move to next character or mark scene as complete
    if (currentSpeakerIndex === characters.length - 1) {
      return {
        currentScene: {
          ...currentScene,
          isComplete: true,
          activeCharacterId: undefined
        }
      };
    } else {
      const nextSpeaker = characters[currentSpeakerIndex + 1];
      return {
        currentScene: {
          ...currentScene,
          activeCharacterId: nextSpeaker.id
        }
      };
    }
  })
}));
