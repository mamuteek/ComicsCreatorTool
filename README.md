# 🎨 AI Comics Creator Tool

A bespoke, full-stack comic book creation tool designed to turn your kids into comic book heroes for a personalized Christmas gift.

---

## 🚀 Quick Start

From `C:\Coding\ComicsCreatorTool`:

```bash
# Start both Frontend (Vite) and Backend (Express) concurrently:
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 🛠 Features

### 1. 📖 Story Script & Scene Director (Gemini AI)
- Type your story idea (e.g. *"Christmas morning adventure finding magical tracks in the snowy backyard"*).
- Choose book length (2, 4, 6, 8 pages).
- Gemini automatically storyboards every page: camera angles (`wide-shot`, `close-up`, `action-shot`), character positions, tailored image prompts, and witty comic dialogue.
- Click **"Apply to Comic Canvas"** to instantly generate the pages!

### 2. 🎨 Character & Style Bible
- Upload reference photos of your kids (used for character face/clothing consistency).
- Define distinctive traits (freckles, glasses, hair color, signature outfit).
- Switch art styles with one click:
  - **European Bande Dessinée** (Tintin / Asterix clean watercolor line art)
  - **Pixar 3D Animation**
  - **Modern Superhero Comic Book**
  - **Whimsical Children's Storybook**
  - **Manga / Anime Adventure**

### 3. 🖼️ Comic Studio (A4 Konva Canvas)
- True **A4 Portrait format** ($210\text{ mm} \times 297\text{ mm}$).
- Choose panel layouts (1-panel splash, 2 vertical, 3 horizontal strips, 4-grid, 5-panel dynamic, 6-panel classic).
- **Interactive Speech Bubbles (React-Konva)**:
  - Speech, Thought, Shout, and Caption bubbles.
  - **Draggable pointer tails** that you can point directly at characters' mouths.
  - Authentic comic fonts (*Comic Neue*, *Bangers*, *Permanent Marker*).
- Pan, zoom, and fit images inside panels.

### 4. 🖨️ Print-Ready A4 PDF Export
- Export single pages or the entire comic book directly to high-res A4 PDF ready for commercial photo book printing (Blurb, Shutterfly, local print shop) or home color printing.

---

## ⚡ Running Local Stable Diffusion on RTX 4060 (8 GB VRAM)

Your RTX 4060 Laptop (8GB) is ideal for local image generation:

1. **Recommended WebUI:** **SD-WebUI Forge** (superior memory management for 8GB GPUs).
2. Launch Forge or AUTOMATIC1111 with the API enabled:
   ```bash
   python launch.py --api --medvram
   ```
3. In the Comics Creator Tool, click **Settings (⚙️)**:
   - Ensure Endpoint is set to `http://127.0.0.1:7860`.
   - Click **"Test"** to verify the green **Connected** status.
4. Click **"Generate Panel Image"** on any panel!

"# ComicsCreatorTool" 
