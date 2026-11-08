import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { generateComicScriptWithGemini } from './services/geminiService.js';
import { generateImageWithLocalSd, checkSdHealth } from './services/sdService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.resolve(__dirname, '../../data/projects');

// Ensure data directory exists
fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images and generated panels statically
app.use('/uploads', express.static(DATA_DIR));

// Setup Multer for character reference photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.projectId || 'default';
    const charDir = path.join(DATA_DIR, projectId, 'characters');
    fs.mkdirSync(charDir, { recursive: true });
    cb(null, charDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'ref-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ----------------------------------------------------------------------------
// Projects API
// ----------------------------------------------------------------------------

// List all projects
app.get('/api/projects', (req, res) => {
  try {
    const dirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const projects = [];
    for (const dir of dirs) {
      const projPath = path.join(DATA_DIR, dir, 'project.json');
      if (fs.existsSync(projPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(projPath, 'utf-8'));
          projects.push(content);
        } catch {}
      }
    }
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  const projPath = path.join(DATA_DIR, req.params.id, 'project.json');
  if (!fs.existsSync(projPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  try {
    const content = JSON.parse(fs.readFileSync(projPath, 'utf-8'));
    res.json(content);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save / update project
app.post('/api/projects', (req, res) => {
  try {
    const project = req.body;
    if (!project.id) {
      return res.status(400).json({ error: 'Missing project id' });
    }
    const projDir = path.join(DATA_DIR, project.id);
    fs.mkdirSync(projDir, { recursive: true });
    fs.writeFileSync(path.join(projDir, 'project.json'), JSON.stringify(project, null, 2), 'utf-8');
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload reference photo for character
app.post('/api/projects/:projectId/characters/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const relativeUrl = `/uploads/${req.params.projectId}/characters/${req.file.filename}`;
  res.json({ url: relativeUrl });
});

// ----------------------------------------------------------------------------
// AI Services API
// ----------------------------------------------------------------------------

// Check Local SD connection health
app.get('/api/sd/health', async (req, res) => {
  const endpoint = (req.query.endpoint as string) || 'http://127.0.0.1:7860';
  const isHealthy = await checkSdHealth(endpoint);
  res.json({ online: isHealthy, endpoint });
});

// Generate comic script with Gemini
app.post('/api/ai/script', async (req, res) => {
  try {
    const { storyOutline, characters, styleName, pageCount, apiKey } = req.body;
    const pages = await generateComicScriptWithGemini({
      storyOutline,
      characters,
      styleName,
      pageCount: pageCount || 4,
      apiKey,
    });
    res.json({ pages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate image via Local Stable Diffusion
app.post('/api/ai/generate-panel', async (req, res) => {
  try {
    const { prompt, negativePrompt, width, height, endpoint, projectId, pageId, panelId } = req.body;
    
    let savePath: string | undefined;
    if (projectId && pageId && panelId) {
      const panelDir = path.join(DATA_DIR, projectId, 'panels');
      fs.mkdirSync(panelDir, { recursive: true });
      savePath = path.join(panelDir, `page_${pageId}_panel_${panelId}_${Date.now()}.png`);
    }

    const result = await generateImageWithLocalSd({
      prompt,
      negativePrompt,
      width: width || 768,
      height: height || 768,
      endpoint,
      savePath,
    });

    // If saved to disk, return the relative URL
    let finalUrl = result.imageUrl;
    if (savePath) {
      finalUrl = `/uploads/${projectId}/panels/${path.basename(savePath)}`;
    }

    res.json({ imageUrl: finalUrl, seed: result.seed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ComicsCreator Server] Running on http://localhost:${PORT}`);
  console.log(`[ComicsCreator Server] Project storage: ${DATA_DIR}`);
});

