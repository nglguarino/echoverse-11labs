# 🎭 Echoverse: AI-Directed Interactive Storytelling

An immersive, AI-powered interactive storytelling application where your choices shape dynamic narratives, brought to life through autonomous AI agents.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai)

## 🌟 Overview

Echoverse implements an **autonomous AI director** that creates unique, adaptive narratives in real-time. Unlike traditional branching stories, every playthrough is genuinely unique, with AI agents managing plot progression, character development, and world-building dynamically.

## 🤖 The AI Director Architecture

### Core Agent Responsibilities

The AI director operates as an autonomous agent with multiple interconnected responsibilities:

```
┌─────────────────────────────────────────────────────┐
│                   AI DIRECTOR AGENT                 │
├─────────────────────────────────────────────────────┤
│  • Genre Selection & Thematic Consistency           │
│  • Character Creation & Personality Management      │
│  • Dynamic Plot Generation & Pacing                 │
│  • Scene Composition & Environmental Design         │
│  • Dialogue Generation with Emotional Context       │
│  • Choice Architecture & Consequence Tracking       │
│  • Ending Detection & Narrative Closure             │
└─────────────────────────────────────────────────────┘
```

### 🎯 Key Features

- **Autonomous Story Generation**: The AI director creates entirely new plots each time
- **Multi-Modal Interaction**: Text input, voice commands, or predefined choices
- **Dynamic Visual Generation**: AI-generated backgrounds and character portraits
- **Voice Acting**: Characters speak with emotion-appropriate AI voices
- **Persistent World State**: Maintains consistency across scenes and choices
- **Intelligent Ending Detection**: Knows when to conclude stories naturally

## 🧠 Agentic Implementation Details

### 1. **State Management & Memory**

The AI director maintains a state system to ensure narrative coherence:

```typescript
// Core state tracked by the AI director
interface DirectorState {
  genre: string;                    // Maintains thematic consistency
  currentScene: Scene;              // Active scene context
  sceneHistory: Scene[];            // Full narrative memory
  storyBackground: string;          // Persistent location
  storyCharacter: Character;        // Character continuity
  storyEnding: StoryEnding | null;  // Narrative closure tracking
}
```

### 2. **Scene Generation Pipeline**

The director follows a complex decision pipeline for each scene:

```typescript
// Simplified scene generation logic
async function generateScene(context: SceneContext) {
  // 1. Ending Detection Phase
  if (!context.ignoreEnding) {
    const shouldEnd = await checkNarrativeCompletion(context);
    if (shouldEnd) return generateEnding(context);
  }

  // 2. Context Analysis Phase
  const scenePrompt = buildContextualPrompt({
    genre: context.genre,
    previousScene: context.currentScene,
    playerChoice: context.lastChoice,
    characterPersistence: context.storyCharacter
  });

  // 3. Scene Generation Phase
  const newScene = await generateWithGPT4(scenePrompt);
  
  // 4. Location Change Detection
  const locationChanged = await detectLocationChange(
    context.currentScene, 
    newScene
  );
  
  // 5. Asset Generation Phase
  if (locationChanged) {
    newScene.background = await generateBackground(newScene.description);
  }
  
  return enrichSceneWithAssets(newScene);
}
```

### 3. **Intelligent Location Management**

The director detects when both the player and character agree to change locations:

```typescript
// Location change detection requires explicit agreement
async function detectLocationChange(prevScene, newScene) {
  // Uses GPT-4 to analyze if both parties agreed to move
  // Prevents unnecessary background regeneration
  // Maintains spatial coherence in the narrative
}
```

### 4. **Character Consistency Engine**

Characters maintain persistent traits across the entire story:

- **Gender consistency** for voice selection
- **Visual appearance** persistence
- **Personality traits** carried through dialogue
- **Name and identity** preservation

### 5. **Dynamic Ending Detection**

The AI director intelligently determines when stories should conclude:

```typescript
interface EndingDetection {
  shouldEnd: boolean;
  type: 'success' | 'game-over';
  message: string;
  achievement?: string;
}
```

The director analyzes:
- Player choices leading to quest completion
- Fatal decisions resulting in game-over scenarios
- Natural narrative conclusion points
- Achievement-worthy moments

## 🛠️ Technical Stack

### Frontend Core
- **React 18** with TypeScript for type-safe development
- **Zustand** for state management
- **Framer Motion** for fluid animations
- **Tailwind CSS** for responsive design

### AI & Generation Services
- **OpenAI GPT-4** for narrative generation and decision-making
- **ElevenLabs** for dynamic text-to-speech with emotional context
- **OpenAI Whisper** for voice command recognition
- **Fal.ai** for real-time image generation

### Backend Infrastructure
- **Supabase Edge Functions** for serverless AI orchestration
- **Deno runtime** for secure, performant execution

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/echoverse.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Required API Keys
- `OPENAI_API_KEY` - For GPT-4 and Whisper
- `ELEVEN_LABS_API_KEY` - For voice synthesis
- `FAL_KEY` - For image generation

## 🎮 How It Works

1. **Genre Selection**: The AI randomly selects from action, thriller, or romance
2. **Initial Scene**: The director creates the opening scene with character and setting
3. **Player Interaction**: Choose via buttons, text input, or voice commands
4. **Dynamic Response**: The AI director processes choices and generates consequences
5. **Story Evolution**: Each decision influences the narrative direction
6. **Natural Conclusion**: The director determines when to end based on narrative flow

## 🔮 Future Enhancements

### Technical Improvements
- [ ] **Multi-Character Support**: Enable scenes with multiple NPCs
- [ ] **Emotional State Tracking**: Add character mood systems
- [ ] **Background Music Engine**: Dynamic soundtrack generation
- [ ] **Advanced Memory Systems**: Long-term plot callbacks and references
- [ ] **Multiplayer Narratives**: Collaborative story experiences

### AI Director Enhancements
- [ ] **Narrative Style Adaptation**: Learn from player preferences
- [ ] **Procedural Quest Generation**: Create multi-scene story arcs
- [ ] **Character Relationship Dynamics**: Track evolving relationships
- [ ] **Environmental Storytelling**: Use settings to convey narrative
- [ ] **Branching Timeline Support**: Enable save states and alternate paths

## 🏗️ Architecture Highlights

1. **Contextual Prompt Engineering**: Carefully crafted prompts maintain consistency
2. **State Machine Design**: Robust state tracking prevents narrative breaks
3. **Asynchronous Asset Pipeline**: Parallel generation of visuals and audio
4. **Error Recovery**: Graceful handling of API failures
5. **Performance Optimization**: Intelligent caching of generated assets

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Inspired by "Choose Your Own Adventure" books
- Built with [Lovable](https://lovable.dev) for rapid development