"use client";

import { Dispatch, SetStateAction } from "react";
import SlideCard from "./SlideCard";
import { BrandPreset, FormatMode, Slide, ThemePresetId, getSlideQuality } from "../types";

type CarouselCanvasProps = {
  slides: Slide[];
  format: FormatMode;
  brand: BrandPreset;
  exportMode: boolean;
  setExportMode: Dispatch<SetStateAction<boolean>>;
  viewMode: "scroll" | "grid";
  setViewMode: Dispatch<SetStateAction<"scroll" | "grid">>;
  slideRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  onDownloadAll: () => void;
  overallQualityScore: number | null;
  loadingIndex: number | null;
  copiedIndex: number | null;
  editing: { index: number; field: "title" | "body" } | null;
  onEdit: (editing: { index: number; field: "title" | "body" } | null) => void;
  onRegenerate: (index: number) => void;
  onDownload: (index: number) => void;
  onCopy: (index: number) => void;
  onUpdateField: (index: number, field: "title" | "body", value: string) => void;
  themePreset: ThemePresetId;
  isHookLoading: boolean;
  showHookPicker: boolean;
  hookOptions: string[];
  onGenerateHooks: () => void;
  onApplyHook: (hook: string) => void;
};

export default function CarouselCanvas({
  slides,
  format,
  brand,
  exportMode,
  setExportMode,
  viewMode,
  setViewMode,
  slideRefs,
  onDownloadAll,
  overallQualityScore,
  loadingIndex,
  copiedIndex,
  editing,
  onEdit,
  onRegenerate,
  onDownload,
  onCopy,
  onUpdateField,
  themePreset,
  isHookLoading,
  showHookPicker,
  hookOptions,
  onGenerateHooks,
  onApplyHook,
}: CarouselCanvasProps) {
  const isMinimalTheme = themePreset === "minimal-white";
  const isPlayfulTheme = themePreset === "playful-kids";
  const headingClass = isMinimalTheme ? "text-black" : "text-white";
  const subHeadingClass = isMinimalTheme ? "text-gray-700" : isPlayfulTheme ? "text-fuchsia-200" : "text-gray-400";
  const mutedTextClass = isMinimalTheme ? "text-gray-500" : isPlayfulTheme ? "text-fuchsia-300/80" : "text-gray-600";

  return (
    <section>
      {exportMode ? (
        <div className="mb-4 rounded-xl border border-yellow-700/50 bg-yellow-900/30 px-4 py-2 text-center text-xs text-yellow-400">
          ✦ Export Mode — UI chrome hidden. Downloads will be clean slides.
        </div>
      ) : null}
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`font-semibold ${headingClass}`}>✦ Your Carousel</h2>
        <span className={`rounded-full px-3 py-1 text-xs ${isMinimalTheme ? "bg-black/10 text-black/80" : "bg-white/10 text-white/80"}`}>
          {slides.length} slides
        </span>
      </div>
      {overallQualityScore !== null ? <p className={`mb-3 text-xs ${subHeadingClass}`}>Content Quality: {overallQualityScore}/100</p> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setViewMode("scroll")}
          aria-label="Switch to scroll view"
          className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
            viewMode === "scroll"
              ? "text-white"
              : isMinimalTheme
                ? "border border-gray-300 bg-white text-gray-700"
                : isPlayfulTheme
                  ? "bg-[#2b1650] text-pink-100"
                  : "bg-[#1a1a1a] text-gray-400"
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
          style={viewMode === "scroll" ? { backgroundColor: brand.primaryColor } : undefined}
        >
          ⟷ Scroll
        </button>
        <button
          type="button"
          onClick={() => setViewMode("grid")}
          aria-label="Switch to grid view"
          className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
            viewMode === "grid"
              ? "text-white"
              : isMinimalTheme
                ? "border border-gray-300 bg-white text-gray-700"
                : isPlayfulTheme
                  ? "bg-[#2b1650] text-pink-100"
                  : "bg-[#1a1a1a] text-gray-400"
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
          style={viewMode === "grid" ? { backgroundColor: brand.primaryColor } : undefined}
        >
          ⊞ Grid
        </button>
        <button
          type="button"
          onClick={() => setExportMode((prev) => !prev)}
          aria-label="Toggle export mode"
          className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
            exportMode
              ? "text-white"
              : isMinimalTheme
                ? "border border-gray-300 bg-white text-gray-700"
                : isPlayfulTheme
                  ? "bg-[#2b1650] text-pink-100"
                  : "bg-[#1a1a1a] text-gray-400"
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
          style={exportMode ? { backgroundColor: brand.primaryColor } : undefined}
        >
          ✦ Export Mode
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={onGenerateHooks}
            disabled={isHookLoading}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border border-gray-300 bg-white text-gray-700 hover:text-black" : isPlayfulTheme ? "bg-[#2b1650] text-pink-100 hover:text-white" : "bg-[#1a1a1a] text-gray-300 hover:text-purple-300"}`}
          >
            {isHookLoading ? "Generating Hooks..." : "Try Better Hooks"}
          </button>
          {showHookPicker && hookOptions.length > 0 ? (
            <div className={`absolute left-0 top-9 z-40 w-72 rounded-xl p-2 shadow-xl ${isMinimalTheme ? "border border-gray-300 bg-white" : isPlayfulTheme ? "border border-pink-300/40 bg-[#2b1650]" : "border border-white/15 bg-[#121212]"}`}>
              <p className={`mb-2 px-2 text-[11px] ${mutedTextClass}`}>Pick a hook for slide 1</p>
              <div className="flex flex-col gap-1">
                {hookOptions.map((hook) => (
                  <button
                    key={hook}
                    type="button"
                    onClick={() => onApplyHook(hook)}
                    className={`rounded-lg px-2 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "text-gray-800 hover:bg-black/5" : isPlayfulTheme ? "text-pink-50 hover:bg-white/10" : "text-gray-200 hover:bg-white/10"}`}
                  >
                    {hook}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={viewMode === "grid" ? "grid grid-cols-1 gap-6 pb-4 sm:grid-cols-2 lg:grid-cols-3" : "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"}
        style={viewMode === "scroll" ? ({ WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" } as React.CSSProperties) : undefined}
      >
        {slides.map((slide, index) => {
          const quality = getSlideQuality(slide);
          return (
            <div key={index} className={viewMode === "grid" ? "flex justify-center" : "snap-start flex-shrink-0"}>
              <SlideCard
                slide={slide}
                quality={quality}
                index={index}
                slidesLength={slides.length}
                format={format}
                brand={brand}
                exportMode={exportMode}
                isRegenerating={loadingIndex === index}
                onEdit={onEdit}
                onRegenerate={onRegenerate}
                onDownload={onDownload}
                onCopy={onCopy}
                copiedIndex={copiedIndex}
                editing={editing}
                onUpdateField={onUpdateField}
                slideRef={(element) => {
                  slideRefs.current[index] = element;
                }}
                themePreset={themePreset}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-center sm:justify-start">
        <button
          type="button"
          onClick={onDownloadAll}
          className={`w-full rounded-xl px-6 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 sm:w-auto ${isMinimalTheme ? "border border-gray-300 text-gray-800 hover:border-black hover:text-black" : isPlayfulTheme ? "border border-pink-300/40 text-pink-100 hover:border-pink-300 hover:text-white" : "border border-gray-700 text-gray-300 hover:border-purple-500 hover:text-purple-400"}`}
        >
          ⬇ Download All 5 Slides as PNG
        </button>
      </div>
      <p className={`mt-1 text-center text-xs sm:text-left ${subHeadingClass}`}>High-resolution • Instagram-ready • 1080px</p>
    </section>
  );
}
