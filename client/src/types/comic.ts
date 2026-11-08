export interface Character {
  id: string;
  name: string;
  age?: number;
  role: string;
  description: string;
  outfit: string;
  hairStyleAndColor: string;
  distinctiveFeatures: string;
  triggerTags: string; // e.g. "little blonde girl, red superhero cape, yellow star emblem"
  referenceImages: string[]; // Paths or URLs to uploaded reference photos
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  positivePromptPrefix: string;
  negativePrompt: string;
  previewUrl?: string;
}

export type BubbleType = 'speech' | 'thought' | 'shout' | 'caption' | 'sfx';

export interface SpeechBubble {
  id: string;
  type: BubbleType;
  text: string;
  x: number; // Percentage of panel or absolute pixels
  y: number;
  width: number;
  height: number;
  tailX: number; // Pointer tip position
  tailY: number;
  fontSize: number;
  fontFamily: 'Comic Neue' | 'Bangers' | 'Permanent Marker' | 'Special Elite';
  textColor: string;
  bgColor: string;
  borderColor: string;
  characterId?: string;
}

export interface ComicPanel {
  id: string;
  order: number;
  x: number; // Percentage (0-100) or pixels in A4 grid
  y: number;
  width: number;
  height: number;
  description: string; // What happens visually
  characterIds: string[]; // Characters present in panel
  shotType: 'close-up' | 'medium-shot' | 'wide-shot' | 'action-shot' | 'over-the-shoulder';
  imagePrompt: string;
  imageUrl?: string;
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  bubbles: SpeechBubble[];
  isGenerating?: boolean;
}

export interface ComicPage {
  id: string;
  pageNumber: number;
  title?: string;
  layoutTemplate: '1-panel' | '2-vertical' | '3-horizontal' | '4-grid' | '5-dynamic' | '6-classic';
  panels: ComicPanel[];
  notes?: string;
}

export interface ComicProject {
  id: string;
  title: string;
  author: string;
  targetAudience: string; // e.g. "My kids (Emma & Lucas)"
  storyTheme: string;
  globalStyle: StylePreset;
  characters: Character[];
  pages: ComicPage[];
  createdAt: string;
  updatedAt: string;
  settings: {
    format: 'A4';
    orientation: 'portrait';
    llmProvider: 'gemini' | 'openai' | 'claude';
    geminiApiKey?: string;
    openaiApiKey?: string;
    claudeApiKey?: string;
    sdApiEndpoint: string; // default http://127.0.0.1:7860 (Forge/A1111) or 8188 (ComfyUI)
    sdBackendType: 'forge' | 'a1111' | 'comfyui' | 'cloud';
  };
}

