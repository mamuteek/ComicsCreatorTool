import { StylePreset } from '../types/comic';

export const DEFAULT_STYLE_PRESETS: StylePreset[] = [
  {
    id: 'franco-belge',
    name: 'European Bande Dessinée (Tintin / Asterix style)',
    description: 'Crisp ink line art with soft, vibrant watercolor shading, clean backgrounds, and expressive cartoon anatomy.',
    positivePromptPrefix: 'franco-belgian comic style, ligne claire, clean vibrant ink lineart, crisp watercolor colors, expressive characters, detailed comic book background, bande dessinee art, masterpiece, highly detailed',
    negativePrompt: 'photorealistic, 3d render, blurry, distorted, ugly, extra limbs, dull colors, dark gritty, text, watermark',
  },
  {
    id: 'pixar-3d',
    name: 'Pixar / 3D Animated Film',
    description: 'Charming 3D animated character design, warm cinematic lighting, soft textures, and vivid colors.',
    positivePromptPrefix: 'pixar 3d animation render style, cute stylized character, expressive big eyes, soft volumetric lighting, subsurface scattering, disney animation studio quality, vibrant cinematic, octane render, 8k',
    negativePrompt: '2d flat, sketchy, photorealistic, uncanny valley, gloomy, deformed, bad anatomy, text, watermark',
  },
  {
    id: 'modern-comic-book',
    name: 'Modern Hero Comic Book',
    description: 'Dynamic comic book coloring with bold black inks, cel-shading, action poses, and vibrant highlights.',
    positivePromptPrefix: 'modern superhero comic book illustration, dynamic cel-shaded coloring, bold ink contours, dramatic lighting, heroic perspective, marvel and dc graphic novel aesthetic, cinematic composition',
    negativePrompt: 'photorealistic, low quality, washed out, blurry, distorted faces, mutated hands, text, watermark',
  },
  {
    id: 'childrens-storybook',
    name: 'Whimsical Children’s Storybook',
    description: 'Gentle pastel illustrations with textured storybook pencils and gouache warmth, perfect for younger kids.',
    positivePromptPrefix: 'whimsical children book illustration, gentle pastel color palette, gouache and pencil texture, warm cozy lighting, charming storybook art, beatrix potter aesthetic, adorable and heartwarming',
    negativePrompt: 'dark, scary, violent, photorealistic, harsh shadows, sharp edges, text, watermark',
  },
  {
    id: 'manga-anime',
    name: 'Anime / Manga Color Adventure',
    description: 'Japanese animation / webtoon full color style with bright eyes, sharp hair highlights, and energetic framing.',
    positivePromptPrefix: 'modern anime adventure style, full color manga, studio ghibli inspired background, vibrant cel shading, expressive anime eyes, dynamic scene, detailed clean art',
    negativePrompt: 'monochrome, black and white, realistic photo, western gritty, bad anatomy, text, watermark',
  },
];

