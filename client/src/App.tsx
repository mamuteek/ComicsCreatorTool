import React, { useState, useEffect } from 'react';
import { ComicProject, ComicPage, ComicPanel } from './types/comic';
import { DEFAULT_STYLE_PRESETS } from './data/defaultStyles';
import { ComicCanvas } from './components/canvas/ComicCanvas';
import { CharacterBible } from './components/bible/CharacterBible';
import { ScriptDirector } from './components/script/ScriptDirector';
import { SettingsModal } from './components/settings/SettingsModal';
import { ExportModal } from './components/export/ExportModal';
import {
  BookOpen,
  Users,
  Palette,
  Settings,
  Printer,
  Plus,
  Save,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const INITIAL_PROJECT: ComicProject = {
  id: 'project-christmas-2026',
  title: 'The Great Christmas Backyard Adventure',
  author: 'Dad',
  targetAudience: 'My Kids',
  storyTheme: 'On Christmas morning, two kid heroes wake up and find glowing magical tracks in the snowy backyard leading to an enchanted winter quest!',
  globalStyle: DEFAULT_STYLE_PRESETS[0], // Franco-Belge
  characters: [
    {
      id: 'char-1',
      name: 'Emma',
      role: 'The Brave Explorer',
      description: 'Clever 8-year-old girl who loves maps and solving mysteries.',
      outfit: 'Bright red winter coat, yellow scarf, blue jeans and snow boots',
      hairStyleAndColor: 'Ponytail with blonde hair',
      distinctiveFeatures: 'Freckles on cheeks, bright green eyes',
      triggerTags: '8yo girl, blonde ponytail, red winter coat, yellow scarf',
      referenceImages: [],
    },
    {
      id: 'char-2',
      name: 'Lucas',
      role: 'The Wizard Inventor',
      description: 'Energetic 6-year-old boy carrying magical gadget tools.',
      outfit: 'Green hoodie, blue puffer vest, and superhero goggles',
      hairStyleAndColor: 'Messy brown hair',
      distinctiveFeatures: 'Cheeky grin, blue eyes',
      triggerTags: '6yo boy, messy brown hair, green hoodie, blue puffer vest, aviator goggles',
      referenceImages: [],
    },
  ],
  pages: [
    {
      id: 'page-1',
      pageNumber: 1,
      title: 'The Mysterious Tracks',
      layoutTemplate: '4-grid',
      panels: [
        {
          id: 'p1-panel-1',
          order: 1,
          x: 3,
          y: 3,
          width: 45.5,
          height: 45.5,
          shotType: 'wide-shot',
          description: 'Snowy backyard on Christmas morning with glowing blue magical tracks leading towards the old pine tree.',
          characterIds: ['char-1', 'char-2'],
          imagePrompt: 'franco-belgian comic style, ligne claire, snowy backyard Christmas morning, glowing magical blue reindeer tracks in snow, pine trees, detailed comic art',
          bubbles: [
            {
              id: 'b1',
              type: 'caption',
              text: 'Christmas morning started like any other...',
              x: 10,
              y: 10,
              width: 180,
              height: 40,
              tailX: 0,
              tailY: 0,
              fontSize: 13,
              fontFamily: 'Comic Neue',
              textColor: '#000000',
              bgColor: '#ffffff',
              borderColor: '#000000',
            },
          ],
        },
        {
          id: 'p1-panel-2',
          order: 2,
          x: 51.5,
          y: 3,
          width: 45.5,
          height: 45.5,
          shotType: 'close-up',
          description: 'Emma peering out the frost-covered window with binoculars, looking surprised.',
          characterIds: ['char-1'],
          imagePrompt: 'franco-belgian comic style, close-up of 8yo girl with blonde ponytail, red winter coat, looking through binoculars with wide excited eyes, frosted window',
          bubbles: [
            {
              id: 'b2',
              type: 'speech',
              text: 'Lucas! Come look! Those are NOT dog footprints!',
              x: 20,
              y: 20,
              width: 160,
              height: 60,
              tailX: 25,
              tailY: 90,
              fontSize: 13,
              fontFamily: 'Comic Neue',
              textColor: '#000000',
              bgColor: '#ffffff',
              borderColor: '#000000',
            },
          ],
        },
        {
          id: 'p1-panel-3',
          order: 3,
          x: 3,
          y: 51.5,
          width: 45.5,
          height: 45.5,
          shotType: 'medium-shot',
          description: 'Lucas strapping on his goggles and holding a homemade wooden scanner gizmo.',
          characterIds: ['char-2'],
          imagePrompt: 'franco-belgian comic style, 6yo boy with messy brown hair and green hoodie, putting on aviator goggles, holding glowing toy gadget detector, smiling excitedly',
          bubbles: [
            {
              id: 'b3',
              type: 'speech',
              text: 'My tracker is detecting magic! Let\'s go!',
              x: 25,
              y: 20,
              width: 150,
              height: 55,
              tailX: 30,
              tailY: 85,
              fontSize: 13,
              fontFamily: 'Comic Neue',
              textColor: '#000000',
              bgColor: '#ffffff',
              borderColor: '#000000',
            },
          ],
        },
        {
          id: 'p1-panel-4',
          order: 4,
          x: 51.5,
          y: 51.5,
          width: 45.5,
          height: 45.5,
          shotType: 'action-shot',
          description: 'Both kids running through the deep snow out into the yard towards the glowing portal in the woods.',
          characterIds: ['char-1', 'char-2'],
          imagePrompt: 'franco-belgian comic style, dynamic shot of two kids running through deep snow in backyard, girl in red coat and boy in green hoodie, glowing magical portal in trees ahead',
          bubbles: [
            {
              id: 'b4',
              type: 'shout',
              text: 'ADVENTURE TIME!',
              x: 30,
              y: 30,
              width: 140,
              height: 45,
              tailX: 20,
              tailY: 80,
              fontSize: 14,
              fontFamily: 'Bangers',
              textColor: '#e11d48',
              bgColor: '#fef08a',
              borderColor: '#e11d48',
            },
          ],
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    format: 'A4',
    orientation: 'portrait',
    llmProvider: 'gemini',
    sdApiEndpoint: 'http://127.0.0.1:7860',
    sdBackendType: 'forge',
  },
};

export default function App() {
  const [project, setProject] = useState<ComicProject>(() => {
    const saved = localStorage.getItem('comics_creator_active_project');
    return saved ? JSON.parse(saved) : INITIAL_PROJECT;
  });

  const [activeTab, setActiveTab] = useState<'canvas' | 'script' | 'bible'>('canvas');
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Auto-save to localStorage and backend
  useEffect(() => {
    localStorage.setItem('comics_creator_active_project', JSON.stringify(project));
  }, [project]);

  const saveProjectToDisk = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
    } catch (err) {
      console.warn('Backend save failed:', err);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const activePage = project.pages[activePageIndex] || project.pages[0];

  const handleUpdatePage = (updatedPage: ComicPage) => {
    const newPages = project.pages.map((p, idx) =>
      idx === activePageIndex ? updatedPage : p
    );
    setProject({ ...project, pages: newPages, updatedAt: new Date().toISOString() });
  };

  const handleAddPage = () => {
    const newPage: ComicPage = {
      id: `page-${Date.now()}`,
      pageNumber: project.pages.length + 1,
      title: `Page ${project.pages.length + 1}`,
      layoutTemplate: '4-grid',
      panels: [
        {
          id: `panel-${Date.now()}-1`,
          order: 1,
          x: 3,
          y: 3,
          width: 45.5,
          height: 45.5,
          shotType: 'medium-shot',
          description: 'New scene panel',
          characterIds: [],
          imagePrompt: '',
          bubbles: [],
        },
        {
          id: `panel-${Date.now()}-2`,
          order: 2,
          x: 51.5,
          y: 3,
          width: 45.5,
          height: 45.5,
          shotType: 'close-up',
          description: 'New scene panel',
          characterIds: [],
          imagePrompt: '',
          bubbles: [],
        },
      ],
    };
    setProject({ ...project, pages: [...project.pages, newPage] });
    setActivePageIndex(project.pages.length);
  };

  // Generate Panel Image with Local SD / Cloud
  const handleTriggerGenerate = async (panel: ComicPanel) => {
    const updatedPanels = activePage.panels.map((p) =>
      p.id === panel.id ? { ...p, isGenerating: true } : p
    );
    handleUpdatePage({ ...activePage, panels: updatedPanels });

    try {
      const res = await fetch('/api/ai/generate-panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: panel.imagePrompt || `${project.globalStyle.positivePromptPrefix}, ${panel.description}`,
          negativePrompt: project.globalStyle.negativePrompt,
          width: 768,
          height: 768,
          endpoint: project.settings.sdApiEndpoint,
          projectId: project.id,
          pageId: activePage.id,
          panelId: panel.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Generation failed');
      }

      const data = await res.json();
      const finalPanels = activePage.panels.map((p) =>
        p.id === panel.id
          ? { ...p, imageUrl: data.imageUrl, isGenerating: false }
          : p
      );
      handleUpdatePage({ ...activePage, panels: finalPanels });
    } catch (err: any) {
      alert(`Generation Failed: ${err.message}\nMake sure your Local SD (Forge/A1111) is running on ${project.settings.sdApiEndpoint} with --api flag!`);
      const resetPanels = activePage.panels.map((p) =>
        p.id === panel.id ? { ...p, isGenerating: false } : p
      );
      handleUpdatePage({ ...activePage, panels: resetPanels });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <input
              type="text"
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
              className="bg-transparent font-bold text-sm text-white focus:outline-none focus:border-b border-blue-500"
            />
            <div className="text-[11px] text-slate-400">
              Format: <span className="text-slate-200 font-semibold">A4 Portrait</span> • Style:{' '}
              <span className="text-blue-400 font-medium">{project.globalStyle.name}</span>
            </div>
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'canvas'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            Comic Studio (A4)
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'script'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Story & Script
          </button>
          <button
            onClick={() => setActiveTab('bible')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'bible'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Character Bible
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={saveProjectToDisk}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg transition"
            title="Save to disk"
          >
            <Save className="w-3.5 h-3.5 text-blue-400" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'canvas' && (
          <div className="flex flex-col">
            {/* Page Navigation Strip */}
            <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
                  disabled={activePageIndex === 0}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {project.pages.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePageIndex(idx)}
                      className={`px-3 py-1 rounded text-xs font-bold transition ${
                        activePageIndex === idx
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      P. {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={handleAddPage}
                    className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                    title="Add Page"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() =>
                    setActivePageIndex(Math.min(project.pages.length - 1, activePageIndex + 1))
                  }
                  disabled={activePageIndex === project.pages.length - 1}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-slate-400">
                {activePage.title} • {activePage.panels.length} Panels
              </span>
            </div>

            {/* Comic Canvas */}
            <ComicCanvas
              page={activePage}
              onUpdatePage={handleUpdatePage}
              onTriggerGenerate={handleTriggerGenerate}
            />
          </div>
        )}

        {activeTab === 'script' && (
          <ScriptDirector
            storyTheme={project.storyTheme}
            characters={project.characters}
            activeStyle={project.globalStyle}
            onUpdateStoryTheme={(theme) => setProject({ ...project, storyTheme: theme })}
            onApplyScriptToPages={(pages) => setProject({ ...project, pages })}
            geminiApiKey={project.settings.geminiApiKey}
          />
        )}

        {activeTab === 'bible' && (
          <CharacterBible
            characters={project.characters}
            activeStyle={project.globalStyle}
            onUpdateCharacters={(characters) => setProject({ ...project, characters })}
            onUpdateStyle={(style) => setProject({ ...project, globalStyle: style })}
            projectId={project.id}
          />
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={project.settings}
        onUpdateSettings={(newSettings) =>
          setProject({ ...project, settings: newSettings })
        }
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        activePageIndex={activePageIndex}
      />
    </div>
  );
}

