import React, { useState } from 'react';
import { Character, StylePreset, ComicPage, ComicPanel } from '../../types/comic';
import { Sparkles, Wand2, RefreshCw, CheckCircle, BookOpen } from 'lucide-react';
import { LAYOUT_TEMPLATES } from '../../data/defaultLayouts';

interface Props {
  storyTheme: string;
  characters: Character[];
  activeStyle: StylePreset;
  onUpdateStoryTheme: (theme: string) => void;
  onApplyScriptToPages: (pages: ComicPage[]) => void;
  geminiApiKey?: string;
}

export const ScriptDirector: React.FC<Props> = ({
  storyTheme,
  characters,
  activeStyle,
  onUpdateStoryTheme,
  onApplyScriptToPages,
  geminiApiKey,
}) => {
  const [pageCount, setPageCount] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPages, setGeneratedPages] = useState<any[] | null>(null);

  const handleGenerateScript = async () => {
    if (!storyTheme.trim()) {
      alert('Please enter a story idea or outline first!');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyOutline: storyTheme,
          characters: characters.map((c) => ({
            name: c.name,
            description: `${c.role}: ${c.description}. Features: ${c.distinctiveFeatures}`,
            outfit: c.outfit,
          })),
          styleName: activeStyle.name,
          pageCount,
          apiKey: geminiApiKey,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate script');
      }

      const data = await res.json();
      setGeneratedPages(data.pages);
    } catch (err: any) {
      alert(`Script Generation Failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert Gemini output to application ComicPage objects
  const handleApplyToComic = () => {
    if (!generatedPages) return;

    const newPages: ComicPage[] = generatedPages.map((genPage, pIdx) => {
      const template =
        LAYOUT_TEMPLATES.find((t) => t.id === genPage.layoutTemplate) ||
        LAYOUT_TEMPLATES.find((t) => t.panelCount === genPage.panels?.length) ||
        LAYOUT_TEMPLATES[3]; // default 4-grid

      const panels: ComicPanel[] = (genPage.panels || []).map((genPanel: any, panIdx: number) => {
        const layoutPos = template.panels[panIdx] || { x: 3, y: 3, width: 94, height: 94 };

        // Construct full SD prompt combining style + character anchors + action
        const charTags = (genPanel.charactersInPanel || [])
          .map((cName: string) => {
            const char = characters.find((c) => c.name.toLowerCase() === cName.toLowerCase());
            return char?.triggerTags || cName;
          })
          .join(', ');

        const finalPrompt = `${activeStyle.positivePromptPrefix}, ${genPanel.imagePrompt}, featuring ${charTags}`;

        return {
          id: `panel-${Date.now()}-${pIdx}-${panIdx}`,
          order: panIdx + 1,
          x: layoutPos.x,
          y: layoutPos.y,
          width: layoutPos.width,
          height: layoutPos.height,
          shotType: genPanel.shotType || 'medium-shot',
          description: genPanel.description || '',
          characterIds: (genPanel.charactersInPanel || []).map(
            (cName: string) => characters.find((c) => c.name === cName)?.id || cName
          ),
          imagePrompt: finalPrompt,
          bubbles: (genPanel.dialogue || []).map((diag: any, dIdx: number) => ({
            id: `bubble-${Date.now()}-${pIdx}-${panIdx}-${dIdx}`,
            type: diag.type || 'speech',
            text: diag.text,
            x: 20 + dIdx * 25,
            y: 20 + dIdx * 20,
            width: 140,
            height: 60,
            tailX: 20,
            tailY: 85,
            fontSize: 14,
            fontFamily: 'Comic Neue',
            textColor: '#000000',
            bgColor: '#ffffff',
            borderColor: '#000000',
          })),
        };
      });

      return {
        id: `page-${Date.now()}-${pIdx}`,
        pageNumber: pIdx + 1,
        title: genPage.pageTitle || `Page ${pIdx + 1}`,
        layoutTemplate: template.id,
        panels,
      };
    });

    onApplyScriptToPages(newPages);
    alert('Storyboard successfully created and applied to your Comic Book!');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          Story Script & Scene Director
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Type your kids' Christmas story idea, and Gemini will automatically storyboard each page, camera angle, and comic dialogue.
        </p>
      </div>

      {/* Story Outline Input Card */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-200 mb-1.5 block">
            Story Concept or Outline
          </label>
          <textarea
            value={storyTheme}
            onChange={(e) => onUpdateStoryTheme(e.target.value)}
            rows={5}
            placeholder="e.g. On Christmas Eve, Emma and Lucas notice strange glowing reindeer tracks leading into the snowy backyard. When they follow the clues, they discover a magical compass frozen in the treehouse that reveals Santa needs their help..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-300">
              Target Comic Book Length:
            </label>
            <select
              value={pageCount}
              onChange={(e) => setPageCount(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 font-medium"
            >
              <option value={2}>2 Pages (Short Prologue)</option>
              <option value={4}>4 Pages (Standard Holiday Tale)</option>
              <option value={6}>6 Pages (Extended Adventure)</option>
              <option value={8}>8 Pages (Full Comic Episode)</option>
            </select>
          </div>

          <button
            onClick={handleGenerateScript}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Gemini is Director Storyboarding...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Generate Script with Gemini
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Storyboard Preview */}
      {generatedPages && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Generated Comic Storyboard ({generatedPages.length} Pages)
              </h3>
              <p className="text-xs text-slate-400">
                Review the scenes, prompts, and dialogue before applying to your A4 pages.
              </p>
            </div>
            <button
              onClick={handleApplyToComic}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Wand2 className="w-4 h-4" />
              Apply to Comic Canvas
            </button>
          </div>

          <div className="space-y-6">
            {generatedPages.map((page: any, pIdx: number) => (
              <div
                key={pIdx}
                className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sm text-blue-400">
                    Page {page.pageNumber}: {page.pageTitle}
                  </h4>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                    Layout: {page.layoutTemplate}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {page.panels.map((panel: any, panIdx: number) => (
                    <div
                      key={panIdx}
                      className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">
                          Panel {panel.panelNumber}
                        </span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                          {panel.shotType}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-snug">{panel.description}</p>
                      {panel.dialogue && panel.dialogue.length > 0 && (
                        <div className="space-y-1 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                          {panel.dialogue.map((d: any, dIdx: number) => (
                            <div key={dIdx} className="text-slate-300">
                              <span className="font-bold text-amber-300">{d.characterName}: </span>
                              "{d.text}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

