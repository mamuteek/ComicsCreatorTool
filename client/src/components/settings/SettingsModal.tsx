import React, { useState, useEffect } from 'react';
import { ComicProject } from '../../types/comic';
import { X, CheckCircle, AlertTriangle, Key, Cpu, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: ComicProject['settings'];
  onUpdateSettings: (newSettings: ComicProject['settings']) => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [sdStatus, setSdStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    setLocalSettings(settings);
    checkSdStatus(settings.sdApiEndpoint);
  }, [settings, isOpen]);

  const checkSdStatus = async (endpoint: string) => {
    setSdStatus('checking');
    try {
      const res = await fetch(`/api/sd/health?endpoint=${encodeURIComponent(endpoint)}`);
      const data = await res.json();
      setSdStatus(data.online ? 'online' : 'offline');
    } catch {
      setSdStatus('offline');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            AI Engine & Hardware Settings
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* LLM Scripting Engine */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              1. Story & Script AI (Gemini / Multi-LLM)
            </h4>

            <div>
              <label className="text-xs text-slate-300 font-medium mb-1 block">
                LLM Provider
              </label>
              <select
                value={localSettings.llmProvider}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, llmProvider: e.target.value as any })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                <option value="gemini">Google Gemini (Recommended & Fastest)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="claude">Anthropic Claude (3.5 Sonnet)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium mb-1 block">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={localSettings.geminiApiKey || ''}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })
                }
                placeholder="AIzaSy..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Get a free key from Google AI Studio (aistudio.google.com).
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* Local Stable Diffusion Engine */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                2. Local Image Generator (RTX 4060 8GB)
              </h4>
              <div className="flex items-center gap-1.5">
                {sdStatus === 'online' && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Connected
                  </span>
                )}
                {sdStatus === 'offline' && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Not Detected
                  </span>
                )}
                {sdStatus === 'checking' && (
                  <span className="text-[11px] text-slate-400">Checking...</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium mb-1 block">
                Local Backend Type
              </label>
              <select
                value={localSettings.sdBackendType}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, sdBackendType: e.target.value as any })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                <option value="forge">SD-WebUI Forge (Best for 8GB VRAM with IP-Adapter)</option>
                <option value="a1111">AUTOMATIC1111 WebUI</option>
                <option value="comfyui">ComfyUI</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium mb-1 block">
                Local SD API Endpoint
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.sdApiEndpoint}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, sdApiEndpoint: e.target.value })
                  }
                  placeholder="http://127.0.0.1:7860"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => checkSdStatus(localSettings.sdApiEndpoint)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3 py-2 rounded-lg transition"
                >
                  Test
                </button>
              </div>
            </div>

            {/* Laptop 8GB Tip Box */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
              <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block mb-0.5">Tip for RTX 4060 (8 GB VRAM):</strong>
                Launch your local Forge or A1111 with the flags{' '}
                <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">--api --medvram</code>.
                Forge automatically fits SDXL and Flux IP-Adapter into 8GB memory without out-of-memory errors!
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdateSettings(localSettings);
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2 rounded-lg transition shadow-md"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

