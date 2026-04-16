"use client";

import { BrandFont, BrandPreset, BrandTone, ThemePresetId, themePresets } from "../types";

type BrandPanelProps = {
  brand: BrandPreset;
  setBrand: React.Dispatch<React.SetStateAction<BrandPreset>>;
  setTone: (tone: BrandTone) => void;
  onSaveAsNew: () => void;
  onReset: () => void;
  presets: BrandPreset[];
  defaultBrandId: string;
  onApplyPreset: (presetId: string) => void;
  onRenamePreset: (presetId: string, name: string) => void;
  onDeletePreset: (presetId: string) => void;
  onDuplicatePreset: (presetId: string) => void;
  onSetDefaultPreset: (presetId: string) => void;
  themePreset: ThemePresetId;
  onThemePresetChange: (presetId: ThemePresetId) => void;
};

export default function BrandPanel({
  brand,
  setBrand,
  setTone,
  onSaveAsNew,
  onReset,
  presets,
  defaultBrandId,
  onApplyPreset,
  onRenamePreset,
  onDeletePreset,
  onDuplicatePreset,
  onSetDefaultPreset,
  themePreset,
  onThemePresetChange,
}: BrandPanelProps) {
  const isMinimalTheme = themePreset === "minimal-white";
  const isPlayfulTheme = themePreset === "playful-kids";
  const sectionClass = isMinimalTheme
    ? "bg-white border border-black/10"
    : isPlayfulTheme
      ? "border border-pink-300/30 bg-[#1a1133]"
      : "bg-[#111] border border-white/10";
  const headingClass = isMinimalTheme ? "text-black" : "text-white";
  const mutedTextClass = isMinimalTheme ? "text-gray-500" : isPlayfulTheme ? "text-fuchsia-300/80" : "text-gray-600";

  return (
    <section className={`mb-6 rounded-2xl p-6 sm:p-8 ${sectionClass}`}>
      <h3 className={`mb-4 text-sm font-semibold ${headingClass}`}>Brand Library</h3>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => {
          const isActive = preset.id === brand.id;
          const isDefault = preset.id === defaultBrandId;
          return (
            <div
              key={preset.id}
              className={`rounded-xl border p-3 ${isMinimalTheme ? "border-gray-300 bg-gray-50" : isPlayfulTheme ? "border-pink-300/40 bg-[#2b1650]" : "border-gray-800 bg-[#1a1a1a]"}`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className={`truncate text-sm font-medium ${isMinimalTheme ? "text-gray-900" : "text-white"}`}>{preset.name}</p>
                {isDefault ? (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${isMinimalTheme ? "bg-black text-white" : "bg-white text-black"}`}>Default</span>
                ) : null}
              </div>
              <div className="mb-3 flex gap-2">
                <span className="h-4 w-8 rounded" style={{ backgroundColor: preset.primaryColor }} />
                <span className="h-4 w-8 rounded" style={{ backgroundColor: preset.secondaryColor }} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onApplyPreset(preset.id)}
                  className={`rounded-md px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isActive ? "text-white" : isMinimalTheme ? "border border-gray-300 text-gray-700" : "border border-gray-700 text-gray-300"}`}
                  style={isActive ? { backgroundColor: brand.primaryColor } : undefined}
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicatePreset(preset.id)}
                  className={`rounded-md px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border border-gray-300 text-gray-700" : "border border-gray-700 text-gray-300"}`}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextName = window.prompt("Rename preset", preset.name);
                    if (nextName !== null) onRenamePreset(preset.id, nextName);
                  }}
                  className={`rounded-md px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border border-gray-300 text-gray-700" : "border border-gray-700 text-gray-300"}`}
                >
                  Rename
                </button>
                {!isDefault ? (
                  <button
                    type="button"
                    onClick={() => onSetDefaultPreset(preset.id)}
                    className={`rounded-md px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border border-gray-300 text-gray-700" : "border border-gray-700 text-gray-300"}`}
                  >
                    Set default
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onDeletePreset(preset.id)}
                  className={`rounded-md px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border border-red-200 text-red-600" : "border border-red-500/30 text-red-300"}`}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h3 className={`mb-4 text-sm font-semibold ${headingClass}`}>Brand Settings</h3>
      <div className="mb-4">
        <p className={`mb-2 text-xs ${mutedTextClass}`}>Theme Presets</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(themePresets) as ThemePresetId[]).map((presetId) => (
            <button
              key={presetId}
              type="button"
              onClick={() => onThemePresetChange(presetId)}
              className={`rounded-xl px-3 py-1.5 text-xs transition-colors ${
                themePreset === presetId
                  ? "text-white"
                  : isMinimalTheme
                    ? "border border-gray-300 bg-white text-gray-700"
                    : isPlayfulTheme
                      ? "bg-[#2b1650] text-pink-100"
                      : "bg-[#1a1a1a] text-gray-300"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
              style={themePreset === presetId ? { backgroundColor: brand.primaryColor } : undefined}
            >
              {themePresets[presetId].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <label className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${isMinimalTheme ? "border border-gray-300 bg-gray-100 text-gray-800" : isPlayfulTheme ? "border border-pink-300/40 bg-[#2b1650] text-pink-100" : "border border-gray-800 bg-[#1a1a1a] text-gray-300"}`}>
          Primary color
          <input
            type="color"
            value={brand.primaryColor}
            onChange={(event) => setBrand((prev) => ({ ...prev, primaryColor: event.target.value }))}
            className="h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <label className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${isMinimalTheme ? "border border-gray-300 bg-gray-100 text-gray-800" : isPlayfulTheme ? "border border-pink-300/40 bg-[#2b1650] text-pink-100" : "border border-gray-800 bg-[#1a1a1a] text-gray-300"}`}>
          Secondary color
          <input
            type="color"
            value={brand.secondaryColor}
            onChange={(event) => setBrand((prev) => ({ ...prev, secondaryColor: event.target.value }))}
            className="h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <label className={`flex flex-col gap-2 rounded-xl px-3 py-2 text-sm ${isMinimalTheme ? "border border-gray-300 bg-gray-100 text-gray-800" : isPlayfulTheme ? "border border-pink-300/40 bg-[#2b1650] text-pink-100" : "border border-gray-800 bg-[#1a1a1a] text-gray-300"}`}>
          Font style
          <select
            value={brand.fontStyle}
            onChange={(event) => setBrand((prev) => ({ ...prev, fontStyle: event.target.value as BrandFont }))}
            className={`rounded-lg px-2 py-1 text-sm focus:outline-none ${isMinimalTheme ? "border border-gray-300 bg-white text-black" : isPlayfulTheme ? "border border-pink-300/40 bg-[#331b61] text-pink-50" : "border border-gray-700 bg-[#141414] text-white"}`}
          >
            <option value="Inter">Inter</option>
            <option value="System">System</option>
            <option value="Serif">Serif</option>
          </select>
        </label>
        <label className={`flex flex-col gap-2 rounded-xl px-3 py-2 text-sm ${isMinimalTheme ? "border border-gray-300 bg-gray-100 text-gray-800" : isPlayfulTheme ? "border border-pink-300/40 bg-[#2b1650] text-pink-100" : "border border-gray-800 bg-[#1a1a1a] text-gray-300"}`}>
          Tone
          <select
            value={brand.tone}
            onChange={(event) => {
              const nextTone = event.target.value as BrandTone;
              setBrand((prev) => ({ ...prev, tone: nextTone }));
              setTone(nextTone);
            }}
            className={`rounded-lg px-2 py-1 text-sm focus:outline-none ${isMinimalTheme ? "border border-gray-300 bg-white text-black" : isPlayfulTheme ? "border border-pink-300/40 bg-[#331b61] text-pink-50" : "border border-gray-700 bg-[#141414] text-white"}`}
          >
            <option value="Educational">Educational</option>
            <option value="Emotional">Emotional</option>
            <option value="Storytelling">Storytelling</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onSaveAsNew}
          className={`rounded-xl px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border border-gray-300 text-gray-800 hover:border-black hover:text-black" : isPlayfulTheme ? "border border-pink-300/40 text-pink-100 hover:border-pink-300 hover:text-white" : "border border-gray-700 text-gray-300 hover:border-purple-500 hover:text-purple-400"}`}
        >
          Save As New
        </button>
        <button
          type="button"
          onClick={onReset}
          className={`rounded-xl px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border border-gray-300 text-gray-800 hover:border-black hover:text-black" : isPlayfulTheme ? "border border-pink-300/40 text-pink-100 hover:border-pink-300 hover:text-white" : "border border-gray-700 text-gray-300 hover:border-purple-500 hover:text-purple-400"}`}
        >
          Reset Brand
        </button>
      </div>
    </section>
  );
}
