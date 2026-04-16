"use client";

import { useRef } from "react";
import { FormatMode } from "../types";
import { formatConfig } from "../types";

export function useDownload(format: FormatMode, slidesCount: number, onDone?: (slidesCount: number) => void) {
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  async function downloadSlide(index: number) {
    const node = slideRefs.current[index];
    if (!node) return;
    const { toPng } = await import("html-to-image");
    const selectedFormat = formatConfig[format];
    const dataUrl = await toPng(node, {
      pixelRatio: 1,
      canvasWidth: selectedFormat.exportWidth,
      canvasHeight: selectedFormat.exportHeight,
    });
    const link = document.createElement("a");
    link.download = `${format}-slide-${index + 1}.png`;
    link.href = dataUrl;
    link.click();
  }

  const downloadAll = async () => {
    for (let i = 0; i < slidesCount; i++) {
      await downloadSlide(i);
      await new Promise((r) => setTimeout(r, 200));
    }
    onDone?.(slidesCount);
  };

  return { slideRefs, downloadSlide, downloadAll };
}
