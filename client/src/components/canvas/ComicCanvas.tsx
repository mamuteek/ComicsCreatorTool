import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { ComicPage, ComicPanel, SpeechBubble, BubbleType } from '../../types/comic';
import { PanelItem } from './PanelItem';
import {
  MessageSquare,
  Cloud,
  AlertCircle,
  Type,
  Trash2,
  Wand2,
  RefreshCw,
  Move,
  Maximize2,
  PlusSquare,
  Copy,
  Sliders,
} from 'lucide-react';
import { LAYOUT_TEMPLATES } from '../../data/defaultLayouts';

interface Props {
  page: ComicPage;
  onUpdatePage: (updated: ComicPage) => void;
  onTriggerGenerate: (panel: ComicPanel) => void;
}

export const ComicCanvas: React.FC<Props> = ({
  page,
  onUpdatePage,
  onTriggerGenerate,
}) => {
  const stageRef = useRef<any>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(
    page.panels[0]?.id || null
  );
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const [panelEditMode, setPanelEditMode] = useState<'frame' | 'image'>('frame');

  // A4 dimensions in pixels for standard screen rendering (Width: 650px, Height: 919px)
  const STAGE_WIDTH = 650;
  const STAGE_HEIGHT = Math.round(STAGE_WIDTH * 1.4142);

  const selectedPanel = page.panels.find((p) => p.id === selectedPanelId);
  const selectedBubble = selectedPanel?.bubbles.find((b) => b.id === selectedBubbleId);

  // Apply layout template
  const handleApplyLayout = (templateId: ComicPage['layoutTemplate']) => {
    const template = LAYOUT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const newPanels: ComicPanel[] = template.panels.map((p, idx) => {
      const existing = page.panels[idx];
      return {
        id: existing?.id || `panel-${Date.now()}-${idx}`,
        order: idx + 1,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        shotType: p.shotType,
        description: existing?.description || `Panel ${idx + 1} scene`,
        characterIds: existing?.characterIds || [],
        imagePrompt: existing?.imagePrompt || '',
        imageUrl: existing?.imageUrl,
        imageScale: existing?.imageScale || 1.0,
        imageOffsetX: existing?.imageOffsetX || 0,
        imageOffsetY: existing?.imageOffsetY || 0,
        bubbles: existing?.bubbles || [],
      };
    });

    onUpdatePage({
      ...page,
      layoutTemplate: templateId,
      panels: newPanels,
    });
    if (newPanels.length > 0) {
      setSelectedPanelId(newPanels[0].id);
    }
  };

  // Add a new custom panel freely
  const handleAddNewPanel = () => {
    const newPanel: ComicPanel = {
      id: `panel-${Date.now()}`,
      order: page.panels.length + 1,
      x: 10 + (page.panels.length % 3) * 5,
      y: 10 + (page.panels.length % 3) * 5,
      width: 45,
      height: 35,
      shotType: 'medium-shot',
      description: `Panel ${page.panels.length + 1} scene`,
      characterIds: [],
      imagePrompt: '',
      imageScale: 1.0,
      imageOffsetX: 0,
      imageOffsetY: 0,
      bubbles: [],
    };

    onUpdatePage({
      ...page,
      panels: [...page.panels, newPanel],
    });
    setSelectedPanelId(newPanel.id);
  };

  // Duplicate selected panel
  const handleDuplicatePanel = () => {
    if (!selectedPanel) return;

    const duplicated: ComicPanel = {
      ...selectedPanel,
      id: `panel-${Date.now()}`,
      order: page.panels.length + 1,
      x: Math.min(50, selectedPanel.x + 5),
      y: Math.min(50, selectedPanel.y + 5),
      bubbles: selectedPanel.bubbles.map((b) => ({
        ...b,
        id: `bubble-${Date.now()}-${Math.random()}`,
      })),
    };

    onUpdatePage({
      ...page,
      panels: [...page.panels, duplicated],
    });
    setSelectedPanelId(duplicated.id);
  };

  // Delete selected panel
  const handleDeletePanel = () => {
    if (!selectedPanelId || page.panels.length <= 1) return;

    const remaining = page.panels
      .filter((p) => p.id !== selectedPanelId)
      .map((p, idx) => ({ ...p, order: idx + 1 }));

    onUpdatePage({
      ...page,
      panels: remaining,
    });
    setSelectedPanelId(remaining[0]?.id || null);
  };

  // Add speech bubble to selected panel
  const handleAddBubble = (type: BubbleType) => {
    if (!selectedPanel) return;

    const newBubble: SpeechBubble = {
      id: `bubble-${Date.now()}`,
      type,
      text: type === 'caption' ? 'Meanwhile...' : 'Hello!',
      x: 30,
      y: 30,
      width: 140,
      height: 60,
      tailX: 20,
      tailY: 85,
      fontSize: 14,
      fontFamily: 'Comic Neue',
      textColor: '#000000',
      bgColor: '#ffffff',
      borderColor: '#000000',
    };

    const updatedPanel = {
      ...selectedPanel,
      bubbles: [...selectedPanel.bubbles, newBubble],
    };

    onUpdatePage({
      ...page,
      panels: page.panels.map((p) => (p.id === selectedPanel.id ? updatedPanel : p)),
    });
    setSelectedBubbleId(newBubble.id);
  };

  // Delete selected bubble
  const handleDeleteBubble = () => {
    if (!selectedPanel || !selectedBubbleId) return;

    const updatedPanel = {
      ...selectedPanel,
      bubbles: selectedPanel.bubbles.filter((b) => b.id !== selectedBubbleId),
    };

    onUpdatePage({
      ...page,
      panels: page.panels.map((p) => (p.id === selectedPanel.id ? updatedPanel : p)),
    });
    setSelectedBubbleId(null);
  };

  const handleUpdatePanel = (updated: ComicPanel) => {
    onUpdatePage({
      ...page,
      panels: page.panels.map((p) => (p.id === updated.id ? updated : p)),
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center p-4">
      {/* Canvas Area */}
      <div className="flex flex-col items-center">
        {/* Top Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/90 border border-slate-700 p-2.5 rounded-xl mb-4 shadow-lg w-full max-w-[650px]">
          {/* Layout presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Presets:</span>
            <select
              value={page.layoutTemplate}
              onChange={(e) => handleApplyLayout(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
            >
              {LAYOUT_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Panel Management Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddNewPanel}
              className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition"
              title="Add a custom panel anywhere on page"
            >
              <PlusSquare className="w-3.5 h-3.5 text-blue-400" />
              Add Panel
            </button>
            {selectedPanel && (
              <>
                <button
                  onClick={handleDuplicatePanel}
                  className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition"
                  title="Duplicate selected panel"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {page.panels.length > 1 && (
                  <button
                    onClick={handleDeletePanel}
                    className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg border border-rose-500/30 transition"
                    title="Delete selected panel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Secondary Sub-toolbar: Edit Mode Toggle & Speech Bubbles */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl mb-3 shadow w-full max-w-[650px]">
          {/* Interaction Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setPanelEditMode('frame')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
                panelEditMode === 'frame'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Drag / Resize Frame
            </button>
            <button
              onClick={() => setPanelEditMode('image')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
                panelEditMode === 'image'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              Pan / Scale Image
            </button>
          </div>

          {/* Add Bubbles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAddBubble('speech')}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-blue-400 transition"
              title="Add Speech Bubble"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAddBubble('thought')}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-cyan-400 transition"
              title="Add Thought Bubble"
            >
              <Cloud className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAddBubble('shout')}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-amber-400 transition"
              title="Add Shout Bubble"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAddBubble('caption')}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-emerald-400 transition"
              title="Add Narration Caption"
            >
              <Type className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Konva Stage Container with A4 White Canvas */}
        <div className="bg-white rounded-lg shadow-2xl border-4 border-slate-700 overflow-hidden">
          <Stage
            ref={stageRef}
            width={STAGE_WIDTH}
            height={STAGE_HEIGHT}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedBubbleId(null);
              }
            }}
          >
            <Layer>
              {/* Paper Background */}
              <Rect width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#ffffff" />

              {/* Panels */}
              {page.panels.map((panel) => (
                <PanelItem
                  key={panel.id}
                  panel={panel}
                  stageWidth={STAGE_WIDTH}
                  stageHeight={STAGE_HEIGHT}
                  isSelected={selectedPanelId === panel.id}
                  selectedBubbleId={selectedBubbleId}
                  panelEditMode={panelEditMode}
                  onSelectPanel={() => {
                    setSelectedPanelId(panel.id);
                    setSelectedBubbleId(null);
                  }}
                  onSelectBubble={(bubbleId) => {
                    setSelectedPanelId(panel.id);
                    setSelectedBubbleId(bubbleId);
                  }}
                  onUpdatePanel={handleUpdatePanel}
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Side Inspector Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {selectedPanel && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="font-bold text-sm text-slate-200">
                Panel {selectedPanel.order} Inspector
              </h3>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                {selectedPanel.shotType}
              </span>
            </div>

            {/* Layout Geometry & Position Sliders */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                Position & Dimensions (%)
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">X: {selectedPanel.x}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100 - selectedPanel.width}
                    step={0.5}
                    value={selectedPanel.x}
                    onChange={(e) =>
                      handleUpdatePanel({ ...selectedPanel, x: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Y: {selectedPanel.y}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100 - selectedPanel.height}
                    step={0.5}
                    value={selectedPanel.y}
                    onChange={(e) =>
                      handleUpdatePanel({ ...selectedPanel, y: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Width: {selectedPanel.width}%</label>
                  <input
                    type="range"
                    min={15}
                    max={100 - selectedPanel.x}
                    step={0.5}
                    value={selectedPanel.width}
                    onChange={(e) =>
                      handleUpdatePanel({ ...selectedPanel, width: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Height: {selectedPanel.height}%</label>
                  <input
                    type="range"
                    min={15}
                    max={100 - selectedPanel.y}
                    step={0.5}
                    value={selectedPanel.height}
                    onChange={(e) =>
                      handleUpdatePanel({ ...selectedPanel, height: Number(e.target.value) })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {/* Quick Snap Presets */}
              <div className="pt-2 flex flex-wrap gap-1 border-t border-slate-800">
                <button
                  onClick={() => handleUpdatePanel({ ...selectedPanel, x: 3, width: 94 })}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                >
                  Full Width
                </button>
                <button
                  onClick={() => handleUpdatePanel({ ...selectedPanel, x: 3, width: 45.5 })}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                >
                  Left Half
                </button>
                <button
                  onClick={() => handleUpdatePanel({ ...selectedPanel, x: 51.5, width: 45.5 })}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                >
                  Right Half
                </button>
              </div>
            </div>

            {/* Image Zoom Slider */}
            {selectedPanel.imageUrl && (
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[11px] text-slate-400">Image Scale:</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {Math.round((selectedPanel.imageScale || 1.0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.05}
                  value={selectedPanel.imageScale || 1.0}
                  onChange={(e) =>
                    handleUpdatePanel({
                      ...selectedPanel,
                      imageScale: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-500"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">
                Scene Description
              </label>
              <textarea
                value={selectedPanel.description}
                onChange={(e) =>
                  handleUpdatePanel({ ...selectedPanel, description: e.target.value })
                }
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="What happens in this panel..."
              />
            </div>

            {/* Image Prompt */}
            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">
                Image Generation Prompt
              </label>
              <textarea
                value={selectedPanel.imagePrompt}
                onChange={(e) =>
                  handleUpdatePanel({ ...selectedPanel, imagePrompt: e.target.value })
                }
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                placeholder="Detailed Stable Diffusion prompt..."
              />
            </div>

            {/* Generate Image Button */}
            <button
              onClick={() => onTriggerGenerate(selectedPanel)}
              disabled={selectedPanel.isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-md transition disabled:opacity-50"
            >
              {selectedPanel.isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating on RTX 4060...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Panel Image
                </>
              )}
            </button>
          </div>
        )}

        {/* Bubble Inspector */}
        {selectedBubble && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
              <h3 className="font-bold text-sm text-slate-200">Speech Bubble Text</h3>
              <button
                onClick={handleDeleteBubble}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
            <div className="mb-3">
              <label className="text-xs text-slate-400 font-semibold mb-1 block">Dialogue</label>
              <textarea
                value={selectedBubble.text}
                onChange={(e) => {
                  if (!selectedPanel) return;
                  const newBubbles = selectedPanel.bubbles.map((b) =>
                    b.id === selectedBubble.id ? { ...b, text: e.target.value } : b
                  );
                  handleUpdatePanel({ ...selectedPanel, bubbles: newBubbles });
                }}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Font Family</label>
                <select
                  value={selectedBubble.fontFamily}
                  onChange={(e) => {
                    if (!selectedPanel) return;
                    const newBubbles = selectedPanel.bubbles.map((b) =>
                      b.id === selectedBubble.id
                        ? { ...b, fontFamily: e.target.value as any }
                        : b
                    );
                    handleUpdatePanel({ ...selectedPanel, bubbles: newBubbles });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                >
                  <option value="Comic Neue">Comic Neue</option>
                  <option value="Bangers">Bangers</option>
                  <option value="Permanent Marker">Marker</option>
                  <option value="Special Elite">Typewriter</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Font Size</label>
                <input
                  type="number"
                  value={selectedBubble.fontSize}
                  onChange={(e) => {
                    if (!selectedPanel) return;
                    const newBubbles = selectedPanel.bubbles.map((b) =>
                      b.id === selectedBubble.id
                        ? { ...b, fontSize: Number(e.target.value) }
                        : b
                    );
                    handleUpdatePanel({ ...selectedPanel, bubbles: newBubbles });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100"
                  min={10}
                  max={36}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
