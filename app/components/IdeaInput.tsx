"use client";

import { BrandPreset, BrandTone, FormatMode, TemplateId, ThemePresetId, contentTemplates, formatConfig, ideaChips } from "../types";

type IdeaInputProps = {
  idea: string;
  setIdea: (value: string) => void;
  tone: BrandTone;
  format: FormatMode;
  setFormat: (value: FormatMode) => void;
  template: TemplateId;
  setTemplate: (value: TemplateId) => void;
  isLoading: boolean;
  onGenerate: () => void;
  brand: BrandPreset;
  themePreset: ThemePresetId;
};

export default function IdeaInput({
  idea,
  setIdea,
  tone,
  format,
  setFormat,
  template,
  setTemplate,
  isLoading,
  onGenerate,
  brand,
  themePreset,
}: IdeaInputProps) {
  const isMinimalTheme = themePreset === "minimal-white";
  const isPlayfulTheme = themePreset === "playful-kids";
  const sectionClass = isMinimalTheme
    ? "bg-white border border-black/10"
    : isPlayfulTheme
      ? "border border-pink-300/30 bg-[#1a1133]"
      : "bg-[#111] border border-white/10";
  const mutedTextClass = isMinimalTheme ? "text-gray-500" : isPlayfulTheme ? "text-fuchsia-300/80" : "text-gray-600";
  const inputClass = isMinimalTheme
    ? "h-28 w-full resize-none rounded-xl border border-gray-300 bg-gray-100 p-4 text-base text-black placeholder-gray-500 focus:border-gray-700 focus:outline-none sm:h-32"
    : isPlayfulTheme
      ? "h-28 w-full resize-none rounded-2xl border border-pink-300/40 bg-[#26144a] p-4 text-base text-pink-50 placeholder-pink-200/70 focus:border-pink-300 focus:outline-none sm:h-32"
      : "h-28 w-full resize-none rounded-xl border border-gray-800 bg-[#1a1a1a] p-4 text-base text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none sm:h-32";
  const chipBaseClass = isMinimalTheme
    ? "cursor-pointer rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
    : isPlayfulTheme
      ? "cursor-pointer rounded-full border border-pink-300/40 bg-[#2b1650] px-3 py-1 text-xs text-pink-100 transition-colors hover:border-pink-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
      : "cursor-pointer rounded-full border border-gray-800 bg-[#1a1a1a] px-3 py-1 text-xs text-gray-400 transition-colors hover:border-purple-500 hover:text-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500";

  void tone;

  return (
    <section className={`mb-6 rounded-2xl p-6 sm:p-8 ${sectionClass}`}>
      <label htmlFor="idea" className={`mb-2 block text-sm font-medium ${isMinimalTheme ? "text-gray-800" : "text-gray-300"}`}>
        Your Idea
      </label>
      <textarea
        id="idea"
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        maxLength={200}
        placeholder="Describe your carousel idea... e.g. Why kids forget what they learn"
        className={inputClass}
      />
      <p className={`mt-1 text-right text-xs ${idea.length > 200 ? "text-red-500" : mutedTextClass}`}>
        {idea.length} / 200
      </p>

      <div className="mt-3">
        <p className={`text-xs ${mutedTextClass}`}>Try an idea:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ideaChips.map((chip) => (
            <button key={chip} type="button" onClick={() => setIdea(chip)} className={chipBaseClass}>
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <span className={`text-sm ${isMinimalTheme ? "text-gray-800" : "text-gray-300"}`}>Format</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(formatConfig) as FormatMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFormat(mode)}
                  aria-label={`Select ${formatConfig[mode].label} format`}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    format === mode
                      ? "text-white"
                      : isMinimalTheme
                        ? "border border-gray-300 bg-white text-gray-700"
                        : isPlayfulTheme
                          ? "bg-[#2b1650] text-pink-100"
                          : "bg-[#1a1a1a] text-gray-400"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
                  style={format === mode ? { backgroundColor: brand.primaryColor } : undefined}
                >
                  {formatConfig[mode].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className={`text-sm ${isMinimalTheme ? "text-gray-800" : "text-gray-300"}`}>Template</span>
            <select
              value={template}
              onChange={(event) => setTemplate(event.target.value as TemplateId)}
              className={`rounded-lg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border border-gray-300 bg-white text-black" : isPlayfulTheme ? "border border-pink-300/40 bg-[#331b61] text-pink-50" : "border border-gray-700 bg-[#141414] text-white"}`}
            >
              {contentTemplates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="min-h-[44px] w-full rounded-xl px-8 py-2 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 sm:w-auto"
          style={{ backgroundImage: `linear-gradient(90deg, ${brand.primaryColor}, ${brand.secondaryColor})` }}
        >
          {isLoading ? "⏳ Generating..." : "Generate"}
        </button>
      </div>
    </section>
  );
}
