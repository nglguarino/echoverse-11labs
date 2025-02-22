
import { create } from 'zustand';

interface Scene {
  id: number;
  background: string;
  character: {
    name: string;
    voiceId: string;
    dialogue: string;
  };
  choices: {
    text: string;
    nextSceneId: number;
  }[];
}

interface MovieState {
  genre: string | null;
  isGenerating: boolean;
  currentSceneId: number;
  scenes: Record<string, Scene[]>;
  setGenre: (genre: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentSceneId: (sceneId: number) => void;
  getCurrentScene: () => Scene | null;
}

export const useMovieStore = create<MovieState>((set, get) => ({
  genre: null,
  isGenerating: false,
  currentSceneId: 1,
  scenes: {
    action: [
      {
        id: 1,
        background: "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
        character: {
          name: "Commander Sarah",
          voiceId: "EXAVITQu4vr4xnSDxMaL",
          dialogue: "Agent, we've detected hostile activity in two locations. Should we investigate the abandoned warehouse or the underground bunker?",
        },
        choices: [
          { text: "Investigate warehouse", nextSceneId: 2 },
          { text: "Check bunker", nextSceneId: 3 },
        ],
      },
      {
        id: 2,
        background: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135",
        character: {
          name: "Commander Sarah",
          voiceId: "EXAVITQu4vr4xnSDxMaL",
          dialogue: "We found weapons cache here. Should we secure the area or call for backup?",
        },
        choices: [
          { text: "Secure the area", nextSceneId: 4 },
          { text: "Call backup", nextSceneId: 5 },
        ],
      },
      {
        id: 3,
        background: "https://images.unsplash.com/photo-1548613053-22087dd8edb6",
        character: {
          name: "Commander Sarah",
          voiceId: "EXAVITQu4vr4xnSDxMaL",
          dialogue: "The bunker seems to be a command center. We can hack their systems or plant a tracking device.",
        },
        choices: [
          { text: "Hack systems", nextSceneId: 6 },
          { text: "Plant tracker", nextSceneId: 7 },
        ],
      },
    ],
    thriller: [
      {
        id: 1,
        background: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
        character: {
          name: "Detective Morgan",
          voiceId: "IKne3meq5aSn9XLyUdCD",
          dialogue: "This case is getting more complex. Should we follow the paper trail or interrogate the witness?",
        },
        choices: [
          { text: "Follow paper trail", nextSceneId: 2 },
          { text: "Interrogate witness", nextSceneId: 3 },
        ],
      },
      // Add more thriller scenes...
    ],
    romance: [
      {
        id: 1,
        background: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
        character: {
          name: "Alex",
          voiceId: "pFZP5JQG7iQjIQuC4Bku",
          dialogue: "I've been thinking about our conversation at the café. Should we meet at the park or go for dinner?",
        },
        choices: [
          { text: "Meet at park", nextSceneId: 2 },
          { text: "Go for dinner", nextSceneId: 3 },
        ],
      },
      // Add more romance scenes...
    ],
  },
  setGenre: (genre) => set({ genre, currentSceneId: 1 }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCurrentSceneId: (currentSceneId) => set({ currentSceneId }),
  getCurrentScene: () => {
    const { genre, currentSceneId, scenes } = get();
    if (!genre || !scenes[genre]) return null;
    return scenes[genre].find(scene => scene.id === currentSceneId) || null;
  },
}));
