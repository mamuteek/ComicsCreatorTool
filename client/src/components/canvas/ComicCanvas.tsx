import React, { useRef, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { ComicPage, ComicPanel, SpeechBubble, BubbleType } from '../../types/comic';
import { PanelItem } from './PanelItem';
import { MessageSquare, Cloud, AlertCircle, Type, Trash2, Wand2, RefreshCw } from 'lucide-react';
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
        bubbles: existing?.bubbles || [],
      };
    });

    onUpdatePage({
      ...page,
      layoutTemplate: templateId,
      panels: newPanels,
    });
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
        {/* Canvas Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800 border border-slate-700 p-2 rounded-xl mb-4 shadow-lg w-full max-w-[650px]">
          <span className="text-xs font-semibold text-slate-400 px-2 uppercase">Layout:</span>
          <select
            value={page.layoutTemplate}
            onChange={(e) => handleApplyLayout(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
          >
            {LAYOUT_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.name}
              </option>
            ))}
          </select>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Add Bubbles */}
          <span className="text-xs font-semibold text-slate-400 px-2 uppercase">Add Bubble:</span>
          <button
            onClick={() => handleAddBubble('speech')}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs text-white transition"
            title="Speech Bubble"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            Speech
          </button>
          <button
            onClick={() => handleAddBubble('thought')}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs text-white transition"
            title="Thought Bubble"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            Thought
          </button>
          <button
            onClick={() => handleAddBubble('shout')}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs text-white transition"
            title="Shout / Action Bubble"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Shout
          </button>
          <button
            onClick={() => handleAddBubble('caption')}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs text-white transition"
            title="Narration Caption"
          >
            <Type className="w-3.5 h-3.5 text-emerald-400" />
            Caption
          </button>

          {selectedBubbleId && (
            <button
              onClick={handleDeleteBubble}
              className="ml-auto flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-2 py-1 rounded text-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Bubble
            </button>
          )}
        </div>

        {/* Konva Stage Container with A4 White Canvas */}
        <div className="bg-white rounded-lg shadow-2xl border-4 border-slate-700 overflow-hidden">
          <Stage
            ref={stageRef}
            width={STAGE_WIDTH}
            height={STAGE_HEIGHT}
            onMouseDown={(e) => {
              // Clicked on background stage
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
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
              <h3 className="font-bold text-sm text-slate-200">
                Panel {selectedPanel.order} Inspector
              </h3>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                {selectedPanel.shotType}
              </span>
            </div>

            {/* Description */}
            <div className="mb-3">
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
            <div className="mb-4">
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
            <h3 className="font-bold text-sm text-slate-200 mb-3 border-b border-slate-700 pb-2">
              Speech Bubble Text
            </h3>
            <div className="mb-3">
              <label className="text-xs text-slate-400 font-semibold mb-1 block">
                Dialogue
              </label>
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
                <label className="text-xs text-slate-400 font-semibold mb-1 block">
                  Font Family
                </label>
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
                <label className="text-xs text-slate-400 font-semibold mb-1 block">
                  Font Size
                </label>
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

