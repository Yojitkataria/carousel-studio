"use client";

import { useCallback, useEffect, useState } from "react";
import { ContentTemplate, FormatMode, Slide, BrandTone, getQualityLabel, getSlideQuality } from "../types";

type GenerateArgs = {
  idea: string;
  tone: BrandTone;
  format: FormatMode;
  template: ContentTemplate;
  onBeforeGenerate?: () => void;
  onAfterGenerate?: () => void;
  onSuccess?: (slides: Slide[]) => void;
};

type RegenerateArgs = {
  index: number;
  idea: string;
  tone: BrandTone;
  format: FormatMode;
  onSuccess?: (index: number) => void;
};

export function useGeneration() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [genCount, setGenCount] = useState(200);

  useEffect(() => {
    const count = parseInt(localStorage.getItem("genCount") || "200", 10);
    setGenCount(Number.isNaN(count) ? 200 : count);
  }, []);

  const generateSlides = useCallback(
    async ({ idea, tone, format, template, onBeforeGenerate, onAfterGenerate, onSuccess }: GenerateArgs) => {
      if (isLoading) return;
      onBeforeGenerate?.();
      setIsLoading(true);
      setNotice(null);
      setSlides([]);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, tone, format, template }),
        });
        const data = (await response.json()) as Slide[] | { slides?: Slide[]; error?: string };

        if (!response.ok) {
          const errorMessage = !Array.isArray(data) && data.error ? data.error : "Gemini failed. Please try again.";
          setNotice(errorMessage);
          return;
        }

        const incomingSlides = Array.isArray(data) ? data : data.slides;
        if (Array.isArray(incomingSlides) && incomingSlides.length > 0) {
          const newSlides: Slide[] = incomingSlides.slice(0, 5).map((slide, index) => ({
            title: String(slide.title ?? ""),
            body: String(slide.body ?? ""),
            slideType:
              index === 0
                ? "Hook"
                : index === 4
                  ? "CTA"
                  : slide.slideType === "Hook" || slide.slideType === "CTA"
                    ? slide.slideType
                    : "Content",
          }));
          setSlides(newSlides);
          const source = response.headers.get("x-generator-source");
          setNotice(
            source === "gemini"
              ? "✦ Generated with Gemini AI"
              : "⚡ Generated with Smart Local AI (Gemini unavailable)"
          );
          const count = parseInt(localStorage.getItem("genCount") || "200", 10);
          const nextCount = (Number.isNaN(count) ? 200 : count) + 1;
          localStorage.setItem("genCount", String(nextCount));
          setGenCount(nextCount);
          onSuccess?.(newSlides);
        } else {
          setNotice("No slides returned. Please try again.");
        }
      } catch {
        setNotice("Could not generate slides right now. Please try again.");
      } finally {
        setIsLoading(false);
        onAfterGenerate?.();
      }
    },
    [isLoading]
  );

  const regenerateSlide = useCallback(
    async ({ index, idea, tone, format, onSuccess }: RegenerateArgs) => {
      if (loadingIndex !== null || isLoading) return;
      const currentSlide = slides[index];
      if (!currentSlide) return;
      const qualityLabel = getQualityLabel(getSlideQuality(currentSlide).score);
      setLoadingIndex(index);
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea,
            tone,
            format,
            regenerate: true,
            slideIndex: index,
            carousel: slides,
            currentSlide,
            qualityLabel,
            nonce: Date.now(),
          }),
        });
        const data = (await response.json()) as Slide[] | { slides?: Slide[]; error?: string };
        if (!response.ok) {
          const errorMessage = !Array.isArray(data) && data.error ? data.error : "Could not regenerate this slide.";
          setNotice(errorMessage);
          return;
        }

        const incomingSlides = Array.isArray(data) ? data : data.slides;
        if (!Array.isArray(incomingSlides) || incomingSlides.length === 0) {
          setNotice("No slides returned for regeneration.");
          return;
        }

        const candidate = incomingSlides[index] || incomingSlides[0];
        if (!candidate) {
          setNotice("No replacement slide returned.");
          return;
        }

        const normalizedSlide: Slide = {
          title: String(candidate.title ?? ""),
          body: String(candidate.body ?? ""),
          slideType:
            index === 0
              ? "Hook"
              : index === 4
                ? "CTA"
                : candidate.slideType === "Hook" || candidate.slideType === "CTA"
                  ? candidate.slideType
                  : "Content",
        };

        setSlides((prev) => prev.map((slide, i) => (i === index ? normalizedSlide : slide)));
        const source = response.headers.get("x-generator-source");
        setNotice(
          source === "gemini"
            ? `Slide ${index + 1} improved with Gemini AI.`
            : `Slide ${index + 1} improved with Smart Local AI (Gemini unavailable).`
        );
        onSuccess?.(index);
      } catch {
        setNotice("Could not regenerate this slide right now.");
      } finally {
        setLoadingIndex(null);
      }
    },
    [isLoading, loadingIndex, slides]
  );

  return {
    slides,
    setSlides,
    isLoading,
    loadingIndex,
    notice,
    setNotice,
    genCount,
    generateSlides,
    regenerateSlide,
  };
}
