export interface StoryBreakdownRequest {
  storyOutline: string;
  characters: { name: string; description: string; outfit: string }[];
  styleName: string;
  pageCount: number;
  apiKey: string;
}

export interface GeneratedPanel {
  panelNumber: number;
  description: string;
  charactersInPanel: string[];
  shotType: 'close-up' | 'medium-shot' | 'wide-shot' | 'action-shot' | 'over-the-shoulder';
  imagePrompt: string;
  dialogue?: {
    characterName: string;
    type: 'speech' | 'thought' | 'shout' | 'caption';
    text: string;
  }[];
}

export interface GeneratedPage {
  pageNumber: number;
  pageTitle: string;
  layoutTemplate: '1-panel' | '2-vertical' | '3-horizontal' | '4-grid' | '5-dynamic' | '6-classic';
  panels: GeneratedPanel[];
}

export async function generateComicScriptWithGemini(
  req: StoryBreakdownRequest
): Promise<GeneratedPage[]> {
  const apiKey = req.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is required. Please set it in Settings or GEMINI_API_KEY environment variable.');
  }

  const systemInstruction = `
You are a professional comic book creator, writer, and storyboard artist.
Your job is to transform a story outline into a vivid, fun, and cohesive comic book script designed for an A4 photo book.
The main characters are real kids turned into comic heroes. Maintain their recognizable traits, clothing colors, and personalities across every panel.

For each page, select an appropriate layout template from:
- '1-panel' (Full page dramatic splash or title page)
- '2-vertical' (Two side-by-side tall panels)
- '3-horizontal' (Three wide cinematic strips)
- '4-grid' (2x2 balanced action)
- '5-dynamic' (1 wide establishing shot on top, 4 dynamic panels below)
- '6-classic' (Classic 2x3 European comic grid)

Generate exactly ${req.pageCount} pages.
Each panel must have:
1. 'description': Clear visual direction describing characters, environment, action, and lighting.
2. 'charactersInPanel': Array of character names present.
3. 'shotType': One of ['close-up', 'medium-shot', 'wide-shot', 'action-shot', 'over-the-shoulder'].
4. 'imagePrompt': Highly detailed image generation prompt tailored for Stable Diffusion/Flux. Include character visual anchors, setting, and comic art style cues.
5. 'dialogue': Array of speech bubbles with characterName, type ('speech', 'thought', 'shout', 'caption'), and punchy comic dialogue (short, snappy sentences suitable for kids).

Respond ONLY with valid JSON matching the schema of an array of GeneratedPage objects.
`;

  const userPrompt = `
STORY OUTLINE:
${req.storyOutline}

CHARACTERS:
${JSON.stringify(req.characters, null, 2)}

ART STYLE:
${req.styleName}

DESIRED PAGES: ${req.pageCount}

Generate the full comic script in JSON format.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('No script returned from Gemini.');
  }

  try {
    const parsed = JSON.parse(rawText);
    return Array.isArray(parsed) ? parsed : parsed.pages || [];
  } catch (err: any) {
    throw new Error(`Failed to parse Gemini JSON output: ${err.message}\nRaw: ${rawText}`);
  }
}

