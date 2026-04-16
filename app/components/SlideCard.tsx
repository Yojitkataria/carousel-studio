"use client";

import { useMemo, useState } from "react";
import { BrandPreset, FormatMode, Slide, ThemePresetId, formatConfig, themePresets } from "../types";

type SlideCardProps = {
  slide: Slide;
  quality: { score: number; label: string; color: string };
  index: number;
  slidesLength: number;
  format: FormatMode;
  brand: BrandPreset;
  exportMode: boolean;
  isRegenerating: boolean;
  onEdit: (editing: { index: number; field: "title" | "body" } | null) => void;
  onRegenerate: (index: number) => void;
  onDownload: (index: number) => void;
  onCopy: (index: number) => void;
  copiedIndex: number | null;
  editing: { index: number; field: "title" | "body" } | null;
  onUpdateField: (index: number, field: "title" | "body", value: string) => void;
  slideRef: (element: HTMLDivElement | null) => void;
  themePreset: ThemePresetId;
};

export default function SlideCard({
  slide,
  quality,
  index,
  slidesLength,
  format,
  brand,
  exportMode,
  isRegenerating,
  onEdit,
  onRegenerate,
  onDownload,
  onCopy,
  copiedIndex,
  editing,
  onUpdateField,
  slideRef,
  themePreset,
}: SlideCardProps) {
  const cuemathInstagramUrl = "https://www.instagram.com/cuemath/?hl=en";
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const isStory = format === "story";
  const isMinimalTheme = themePreset === "minimal-white";
  const isPlayfulTheme = themePreset === "playful-kids";
  const cardClass = isMinimalTheme
    ? "group relative cursor-pointer overflow-hidden rounded-xl border border-black/10 shadow-[0_8px_24px_rgba(15,23,42,0.15)] transition-all duration-300 hover:ring-2 hover:ring-black/20"
    : isPlayfulTheme
      ? "group relative cursor-pointer overflow-hidden rounded-[30px] border-2 border-pink-300/40 shadow-[0_10px_30px_rgba(236,72,153,0.2)] transition-all duration-300 hover:ring-2 hover:ring-pink-300/70"
      : "group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:ring-2 hover:ring-white/20";
  const cardOverlayClass = isMinimalTheme ? "pointer-events-none absolute inset-0 bg-white/35" : "pointer-events-none absolute inset-0 bg-black/15";
  const cardTitleClass = isMinimalTheme ? "text-black" : "text-white";
  const cardBodyClass = isMinimalTheme ? "text-black/80" : "text-white/80";
  const cardMetaClass = isMinimalTheme ? "text-black/60" : "text-white/50";
  const activeTheme = themePresets[themePreset];
  const getSlideGradient = (slideIndex: number) =>
    `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.secondaryColor} 55%, ${activeTheme.accentPalette[slideIndex % activeTheme.accentPalette.length]} 100%)`;

  const imageUrl = useMemo(() => {
    const prompt = `${slide.title}, education, minimal illustration, soft colors, modern, clean background, no text`;
    const encoded = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&nologo=true&seed=${index + 42}&model=flux`;
  }, [index, slide.title]);

  return (
    <div
      ref={slideRef}
      className={`${cardClass} slide-card-dim`}
      style={{
        ["--slide-width" as string]: `${formatConfig[format].displayWidth}px`,
        ["--slide-height" as string]: `${formatConfig[format].displayHeight}px`,
        backgroundImage: getSlideGradient(index),
        animation: "slideUp 0.4s ease forwards",
        animationDelay: `${index * 100}ms`,
        opacity: 0,
      }}
    >
      {!exportMode ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRegenerate(index);
          }}
          aria-label={`Regenerate slide ${index + 1}`}
          disabled={isRegenerating}
          title="Smart improve this slide"
          className="absolute right-3 top-3 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs text-white opacity-0 transition hover:bg-white/30 group-hover:opacity-100 disabled:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          {isRegenerating ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/50 border-t-white" />
          ) : (
            "✨"
          )}
        </button>
      ) : null}

      {!imageFailed ? (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{
            opacity: imageLoaded ? 0.5 : 0,
            filter: "blur(0.5px) brightness(0.9)",
            transform: "scale(1.05)",
          }}
          onLoad={() => setImageLoaded(true)}
          onError={(event) => {
            setImageFailed(true);
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}

      <div className={cardOverlayClass} />
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />

      <div className={`absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] tracking-widest ${isMinimalTheme ? "bg-black/10 text-black/70" : "bg-white/15 text-white/60"}`}>
        ✦ CUEMATH
      </div>

      <div className={`relative z-10 flex h-full flex-col justify-between ${exportMode ? "p-10" : isStory ? "p-4 sm:p-5" : "p-8"}`}>
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2 py-0.5 text-xs ${isMinimalTheme ? "bg-black/10 text-black/90" : "bg-white/20 text-white/90"}`}>
            {slide.slideType.toUpperCase()}
          </span>
          <span className={`text-xs ${cardMetaClass}`}>
            {index + 1} / {slidesLength}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center text-center">
          {!exportMode && editing?.index === index && editing.field === "title" ? (
            <input
              autoFocus
              value={slide.title}
              onChange={(event) => onUpdateField(index, "title", event.target.value)}
              onBlur={() => onEdit(null)}
              className={`w-full border-b bg-transparent text-center font-bold outline-none ${isStory ? "text-2xl leading-tight sm:text-3xl" : "text-lg leading-snug sm:text-xl"} ${isMinimalTheme ? "border-black/30 text-black" : "border-white/40 text-white"}`}
            />
          ) : (
            <button
              type="button"
              onClick={() => !exportMode && onEdit({ index, field: "title" })}
              className={`mb-2 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isStory ? "text-2xl leading-tight sm:text-3xl" : "text-lg leading-snug sm:text-xl"} ${cardTitleClass}`}
            >
              {slide.title}
            </button>
          )}

          {!exportMode && editing?.index === index && editing.field === "body" ? (
            <textarea
              autoFocus
              value={slide.body}
              onChange={(event) => onUpdateField(index, "body", event.target.value)}
              onBlur={() => onEdit(null)}
              rows={3}
              className={`w-full resize-none rounded-lg border bg-transparent p-2 text-center outline-none ${isStory ? "text-base leading-snug sm:text-lg" : "text-xs leading-relaxed sm:text-sm"} ${isMinimalTheme ? "border-black/30 text-black/80" : "border-white/30 text-white/80"}`}
            />
          ) : (
            <button
              type="button"
              onClick={() => !exportMode && onEdit({ index, field: "body" })}
              className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isStory ? "text-base leading-snug sm:text-lg" : "text-xs leading-relaxed sm:text-sm"} ${cardBodyClass}`}
            >
              {slide.body}
            </button>
          )}
        </div>

        {!exportMode ? (
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-2">
              <span className={`text-xs ${quality.color}`}>● {quality.label}</span>
              {index === 4 ? (
                <a
                  href={cuemathInstagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "bg-black text-white" : "bg-white text-purple-700"}`}
                >
                  Follow @cuemath
                </a>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => onCopy(index)}
                  aria-label={`Copy slide ${index + 1} text to clipboard`}
                  className={`rounded-lg px-2.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "bg-black/10 text-black hover:bg-black/20" : "bg-white/20 text-white hover:bg-white/30"}`}
                >
                  ⎘
                </button>
                {copiedIndex === index ? (
                  <span className={`absolute -top-7 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-[10px] ${isMinimalTheme ? "bg-black text-white" : "bg-black/70 text-white"}`}>
                    Copied!
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDownload(index)}
                aria-label={`Download slide ${index + 1} as PNG`}
                className={`rounded-lg px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "bg-black/10 text-black hover:bg-black/20" : "bg-white/20 text-white hover:bg-white/30"}`}
              >
                Download
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-center">
            {index === 4 ? (
              <a
                href={cuemathInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "bg-black text-white" : "bg-white text-purple-700"}`}
              >
                Follow @cuemath
              </a>
            ) : (
              <span className={`text-[10px] tracking-wide ${isMinimalTheme ? "text-black/50" : "text-white/40"}`}>Created with Carousel Studio</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
