## Inspiration
"Choose Your Own Adventure" books, the Black Mirror special "Bandersnatch". Everyone loves to play with interactive stories. We can now elevate this experience with AI agents (or even better, AI directors).

## What it does:
Echoverse is an AI-powered interactive storytelling app where you shape the narrative through your choices.

What makes it special is that each scene is brought to life with: <br>
• An AI agent (or director) that creates every time different plots, settings, and characters <br>
• AI generated visuals (backgrounds and characters portraits) <br>
• Characters speaking with nuanced tones, thanks to ElevenLabs <br>
• Multiple ways to interact (text, voice, or choices) <br>

It was particluarly challenging to create the AI director logic, that has to: <br>
• choose randomly a genre for the plot <br>
• create characters and settings <br>
• create dialogues <br>
• keep track of every interaction, updating the plot accordingly <br>
• determine which player's choice would lead to the ending scenes (win or game-over) <br>

## Tech stack:
I built it entirely with Lovable, never had to open any IDE.

Frontend Core:
React 18 (JavaScript framework),
TypeScript (Type-safety),
Vite (Build tool)

Styling & UI:
TailwindCSS (Utility-first CSS),
Shadcn/ui (Component library),
Framer Motion (Animations),
Lucide React (Icons)

State Management:
Zustand (Application state), React Router (Navigation)

Backend Services:
Supabase

AI & Voice Services:
OpenAI API (Story generation), ElevenLabs API (Text-to-speech), OpenAI Whisper (Speech-to-text), fal API (characters and backgrounds generation)

## What's next for Echoverse:
A few technical improvements: <br>
• adding background music and sound effects <br>
• adapt the app for all device sizes (now it displays correctly only on laptops) <br>
• upgrading the director's logic to handle more than one characters per story <br>
• improving the transcript, including also the player's choices <br>

Also, the initial idea was to create a first-person interactive movie, but turned out to be too complex to build for this hackathon; will check its feasibility again.
