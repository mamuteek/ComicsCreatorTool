import React, { useState } from 'react';
import { Character, StylePreset } from '../../types/comic';
import { DEFAULT_STYLE_PRESETS } from '../../data/defaultStyles';
import { UserPlus, Image as ImageIcon, Sparkles, Check, Trash2 } from 'lucide-react';

interface Props {
  characters: Character[];
  activeStyle: StylePreset;
  onUpdateCharacters: (chars: Character[]) => void;
  onUpdateStyle: (style: StylePreset) => void;
  projectId: string;
}

export const CharacterBible: React.FC<Props> = ({
  characters,
  activeStyle,
  onUpdateCharacters,
  onUpdateStyle,
  projectId,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    characters[0]?.id || ''
  );

  const selectedChar = characters.find((c) => c.id === selectedCharId) || characters[0];

  const handleAddCharacter = () => {
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: `Hero ${characters.length + 1}`,
      role: 'Adventurer',
      description: 'Energetic kid ready for a Christmas adventure!',
      outfit: 'Cozy red winter sweater and blue jeans',
      hairStyleAndColor: 'Short brown hair',
      distinctiveFeatures: 'Bright smile, freckles',
      triggerTags: 'young hero, expressive eyes, cartoon style',
      referenceImages: [],
    };
    onUpdateCharacters([...characters, newChar]);
    setSelectedCharId(newChar.id);
  };

  const handleUpdateCurrentChar = (updated: Character) => {
    onUpdateCharacters(characters.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCurrentChar = (charId: string) => {
    const filtered = characters.filter((c) => c.id !== charId);
    onUpdateCharacters(filtered);
    if (filtered.length > 0) {
      setSelectedCharId(filtered[0].id);
    }
  };

  // Upload reference photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !selectedChar) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`/api/projects/${projectId}/characters/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      handleUpdateCurrentChar({
        ...selectedChar,
        referenceImages: [...selectedChar.referenceImages, data.url],
      });
    } catch (err: any) {
      alert(`Error uploading image: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          Character & Art Style Bible
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Define your kids' comic appearances, costume details, and choose the visual art style for consistent generation.
        </p>
      </div>

      {/* Style Presets Section */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          Comic Book Art Style Preset
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEFAULT_STYLE_PRESETS.map((preset) => {
            const isSelected = activeStyle.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onUpdateStyle(preset)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 shadow-md ring-1 ring-blue-500'
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-white">{preset.name}</h4>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {preset.description}
                </p>
                <div className="text-[11px] text-slate-500 font-mono line-clamp-2 bg-slate-950/50 p-1.5 rounded border border-slate-800">
                  {preset.positivePromptPrefix}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Profiles Section */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-200">
            Heroes (Your Kids)
          </h3>
          <button
            onClick={handleAddCharacter}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3 py-2 rounded-lg transition"
          >
            <UserPlus className="w-4 h-4" />
            Add Hero Character
          </button>
        </div>

        {/* Character Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-3 overflow-x-auto">
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedCharId(char.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                selectedChar?.id === char.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {char.name} ({char.role})
            </button>
          ))}
        </div>

        {selectedChar && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Photos & Concept Art */}
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 flex flex-col items-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 self-start">
                Reference Photos (Face & Features)
              </h4>

              {/* Photo Gallery */}
              <div className="w-full grid grid-cols-2 gap-2 mb-4">
                {selectedChar.referenceImages.length > 0 ? (
                  selectedChar.referenceImages.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt="Reference"
                      className="w-full h-28 object-cover rounded-lg border border-slate-700 shadow"
                    />
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 text-center">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">No photos uploaded yet</span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-medium py-2 px-4 rounded-lg cursor-pointer transition">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                Upload Photo of {selectedChar.name}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                Used as character reference (IP-Adapter/ControlNet).
              </p>
            </div>

            {/* Right: Character Prompts & Anchors */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">
                    Hero Name
                  </label>
                  <input
                    type="text"
                    value={selectedChar.name}
                    onChange={(e) =>
                      handleUpdateCurrentChar({ ...selectedChar, name: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">
                    Comic Role / Title
                  </label>
                  <input
                    type="text"
                    value={selectedChar.role}
                    onChange={(e) =>
                      handleUpdateCurrentChar({ ...selectedChar, role: e.target.value })
                    }
                    placeholder="e.g. Master Gadgeteer"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">
                    Hair Style & Color
                  </label>
                  <input
                    type="text"
                    value={selectedChar.hairStyleAndColor}
                    onChange={(e) =>
                      handleUpdateCurrentChar({
                        ...selectedChar,
                        hairStyleAndColor: e.target.value,
                      })
                    }
                    placeholder="e.g. Curly blonde hair, ponytail"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">
                    Signature Outfit / Costume
                  </label>
                  <input
                    type="text"
                    value={selectedChar.outfit}
                    onChange={(e) =>
                      handleUpdateCurrentChar({ ...selectedChar, outfit: e.target.value })
                    }
                    placeholder="e.g. Red winter jacket, starry cape"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">
                  Distinctive Facial & Body Features
                </label>
                <input
                  type="text"
                  value={selectedChar.distinctiveFeatures}
                  onChange={(e) =>
                    handleUpdateCurrentChar({
                      ...selectedChar,
                      distinctiveFeatures: e.target.value,
                    })
                  }
                  placeholder="e.g. Round glasses, freckles on nose"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">
                  AI Prompt Trigger Tags (Appended to Every Generation)
                </label>
                <textarea
                  value={selectedChar.triggerTags}
                  onChange={(e) =>
                    handleUpdateCurrentChar({
                      ...selectedChar,
                      triggerTags: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="e.g. 8yo boy, short brown messy hair, green winter hoodie"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {characters.length > 1 && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleDeleteCurrentChar(selectedChar.id)}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete {selectedChar.name}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

