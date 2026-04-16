"use client";

import { useEffect, useState } from "react";
import { BrandPreset, BrandTone, defaultBrandPreset } from "../types";

const BRAND_PRESETS_KEY = "brandPresets";
const DEFAULT_BRAND_ID_KEY = "defaultBrandId";

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizePreset = (preset: Partial<BrandPreset>, fallback: BrandPreset): BrandPreset => ({
  id: typeof preset.id === "string" && preset.id ? preset.id : makeId(),
  name: typeof preset.name === "string" && preset.name.trim() ? preset.name.trim() : "Untitled Brand",
  primaryColor: preset.primaryColor || fallback.primaryColor,
  secondaryColor: preset.secondaryColor || fallback.secondaryColor,
  fontStyle:
    preset.fontStyle === "System" || preset.fontStyle === "Serif" || preset.fontStyle === "Inter"
      ? preset.fontStyle
      : fallback.fontStyle,
  tone:
    preset.tone === "Educational" || preset.tone === "Emotional" || preset.tone === "Storytelling"
      ? preset.tone
      : fallback.tone,
  createdAt: typeof preset.createdAt === "number" ? preset.createdAt : Date.now(),
});

export function useBrand(
  setTone: (tone: BrandTone) => void,
  setNotice?: (notice: string | null) => void
) {
  const [brand, setBrand] = useState<BrandPreset>(defaultBrandPreset);
  const [brandPresets, setBrandPresets] = useState<BrandPreset[]>([defaultBrandPreset]);
  const [defaultBrandId, setDefaultBrandId] = useState<string>(defaultBrandPreset.id);

  useEffect(() => {
    const storedPresets = localStorage.getItem(BRAND_PRESETS_KEY);
    const storedDefaultId = localStorage.getItem(DEFAULT_BRAND_ID_KEY);
    const legacyBrand = localStorage.getItem("brandPreset");

    try {
      const parsedPresets = storedPresets ? (JSON.parse(storedPresets) as Partial<BrandPreset>[]) : null;
      let nextPresets: BrandPreset[] =
        Array.isArray(parsedPresets) && parsedPresets.length > 0
          ? parsedPresets.map((preset) => normalizePreset(preset, defaultBrandPreset))
          : [defaultBrandPreset];

      if (legacyBrand) {
        const parsedLegacy = JSON.parse(legacyBrand) as Partial<BrandPreset>;
        const migrated = normalizePreset(
          {
            ...parsedLegacy,
            id: "legacy-brand",
            name: "My Saved Brand",
            createdAt: Date.now(),
          },
          defaultBrandPreset
        );
        if (!nextPresets.some((preset) => preset.id === migrated.id)) {
          nextPresets = [migrated, ...nextPresets];
        }
      }

      const resolvedDefaultId =
        storedDefaultId && nextPresets.some((preset) => preset.id === storedDefaultId)
          ? storedDefaultId
          : nextPresets[0].id;
      const initialBrand = nextPresets.find((preset) => preset.id === resolvedDefaultId) || nextPresets[0];

      setBrandPresets(nextPresets);
      setDefaultBrandId(resolvedDefaultId);
      setBrand(initialBrand);
      setTone(initialBrand.tone);
    } catch {
      // Ignore malformed localStorage and use defaults.
      setBrandPresets([defaultBrandPreset]);
      setDefaultBrandId(defaultBrandPreset.id);
      setBrand(defaultBrandPreset);
      setTone(defaultBrandPreset.tone);
    }
  }, [setTone]);

  useEffect(() => {
    localStorage.setItem(BRAND_PRESETS_KEY, JSON.stringify(brandPresets));
  }, [brandPresets]);

  useEffect(() => {
    localStorage.setItem(DEFAULT_BRAND_ID_KEY, defaultBrandId);
  }, [defaultBrandId]);

  const saveCurrentAsPreset = () => {
    const nextPreset: BrandPreset = {
      ...brand,
      id: makeId(),
      name: `${brand.name || "Brand"} Copy`,
      createdAt: Date.now(),
    };
    setBrandPresets((prev) => [nextPreset, ...prev]);
    setNotice?.("Brand preset saved.");
  };

  const applyPreset = (presetId: string) => {
    const selected = brandPresets.find((preset) => preset.id === presetId);
    if (!selected) return;
    setBrand(selected);
    setTone(selected.tone);
    setNotice?.(`Applied "${selected.name}".`);
  };

  const renamePreset = (presetId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBrandPresets((prev) => prev.map((preset) => (preset.id === presetId ? { ...preset, name: trimmed } : preset)));
    if (brand.id === presetId) {
      setBrand((prev) => ({ ...prev, name: trimmed }));
    }
    setNotice?.("Preset renamed.");
  };

  const duplicatePreset = (presetId: string) => {
    const source = brandPresets.find((preset) => preset.id === presetId);
    if (!source) return;
    const duplicate: BrandPreset = {
      ...source,
      id: makeId(),
      name: `${source.name} Copy`,
      createdAt: Date.now(),
    };
    setBrandPresets((prev) => [duplicate, ...prev]);
    setNotice?.("Preset duplicated.");
  };

  const deletePreset = (presetId: string) => {
    if (brandPresets.length <= 1) {
      setNotice?.("At least one preset is required.");
      return;
    }
    const nextPresets = brandPresets.filter((preset) => preset.id !== presetId);
    if (nextPresets.length === brandPresets.length) return;
    setBrandPresets(nextPresets);

    if (defaultBrandId === presetId) {
      setDefaultBrandId(nextPresets[0].id);
    }

    if (brand.id === presetId) {
      setBrand(nextPresets[0]);
      setTone(nextPresets[0].tone);
    }
    setNotice?.("Preset deleted.");
  };

  const setDefaultPreset = (presetId: string) => {
    const exists = brandPresets.some((preset) => preset.id === presetId);
    if (!exists) return;
    setDefaultBrandId(presetId);
    setNotice?.("Default preset updated.");
  };

  const resetBrandPreset = () => {
    setBrand(defaultBrandPreset);
    setTone(defaultBrandPreset.tone);
    setNotice?.("Brand reset to default.");
  };

  return {
    brand,
    setBrand,
    brandPresets,
    defaultBrandId,
    saveCurrentAsPreset,
    applyPreset,
    renamePreset,
    duplicatePreset,
    deletePreset,
    setDefaultPreset,
    resetBrandPreset,
  };
}
