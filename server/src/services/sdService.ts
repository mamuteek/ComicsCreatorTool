import fs from 'fs';
import path from 'path';

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  seed?: number;
  endpoint?: string; // Default: http://127.0.0.1:7860
  backendType?: 'forge' | 'a1111' | 'comfyui' | 'cloud';
  savePath?: string;
}

export async function checkSdHealth(endpoint: string = 'http://127.0.0.1:7860'): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${endpoint.replace(/\/$/, '')}/sdapi/v1/sd-models`, {
      signal: controller.signal,
    });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}

export async function generateImageWithLocalSd(
  options: GenerateImageOptions
): Promise<{ imageUrl: string; seed: number }> {
  const endpoint = (options.endpoint || 'http://127.0.0.1:7860').replace(/\/$/, '');
  
  // A1111 / Forge payload format
  const payload = {
    prompt: options.prompt,
    negative_prompt: options.negativePrompt || 'ugly, deformed, blurry, bad anatomy',
    width: options.width || 768,
    height: options.height || 768,
    steps: options.steps || 25,
    cfg_scale: options.cfgScale || 7.0,
    sampler_name: options.sampler || 'Euler a',
    seed: options.seed || -1,
    batch_size: 1,
    n_iter: 1,
  };

  const response = await fetch(`${endpoint}/sdapi/v1/txt2img`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Local SD generation failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const base64Image = data.images?.[0];
  if (!base64Image) {
    throw new Error('No image returned by Local SD.');
  }

  let finalSeed = options.seed || -1;
  try {
    const info = JSON.parse(data.info || '{}');
    if (info.seed) finalSeed = info.seed;
  } catch {}

  // If savePath is specified, save as PNG file
  if (options.savePath) {
    const buffer = Buffer.from(base64Image, 'base64');
    fs.mkdirSync(path.dirname(options.savePath), { recursive: true });
    fs.writeFileSync(options.savePath, buffer);
    return { imageUrl: options.savePath, seed: finalSeed };
  }

  return {
    imageUrl: `data:image/png;base64,${base64Image}`,
    seed: finalSeed,
  };
}

