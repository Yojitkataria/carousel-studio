"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BrandPanel from "./components/BrandPanel";
import CarouselCanvas from "./components/CarouselCanvas";
import HistoryPanel from "./components/HistoryPanel";
import IdeaInput from "./components/IdeaInput";
import { useBrand } from "./hooks/useBrand";
import { useDownload } from "./hooks/useDownload";
import { useGeneration } from "./hooks/useGeneration";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { BrandTone, FormatMode, ProjectHistoryItem, Slide, TemplateId, ThemePresetId, contentTemplates, fontFamilyMap, getSlideQuality, themePresets } from "./types";

export default function Page() {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState<BrandTone>("Educational");
  const [format, setFormat] = useState<"post" | "story" | "carousel">("carousel");
  const [template, setTemplate] = useState<TemplateId>("auto");
  const [viewMode, setViewMode] = useState<"scroll" | "grid">("scroll");
  const [exportMode, setExportMode] = useState(false);
  const [themePreset, setThemePreset] = useState<ThemePresetId>("dark-modern");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("✓ Carousel ready!");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [hookOptions, setHookOptions] = useState<string[]>([]);
  const [showHookPicker, setShowHookPicker] = useState(false);
  const [isHookLoading, setIsHookLoading] = useState(false);
  const [editing, setEditing] = useState<{ index: number; field: "title" | "body" } | null>(null);
  const [editedSlides, setEditedSlides] = useState<Record<number, boolean>>({});
  const [historyProjects, setHistoryProjects] = useState<ProjectHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistoryProjectId, setSelectedHistoryProjectId] = useState<string | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const copiedTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { slides, setSlides, isLoading, loadingIndex, notice, setNotice, genCount, generateSlides, regenerateSlide } = useGeneration();
  const {
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
  } = useBrand(setTone, setNotice);
  const { slideRefs, downloadSlide, downloadAll } = useDownload(format, slides.length, (count) => triggerToast(`✓ ${count} slides downloaded to your folder`, 3000));

  const isMinimalTheme = themePreset === "minimal-white";
  const isPlayfulTheme = themePreset === "playful-kids";
  const pageBg = isMinimalTheme ? "#f8fafc" : isPlayfulTheme ? "#120a26" : "#0a0a0a";
  const headingClass = isMinimalTheme ? "text-black" : "text-white";
  const subHeadingClass = isMinimalTheme ? "text-gray-700" : isPlayfulTheme ? "text-fuchsia-200" : "text-gray-400";
  const mutedTextClass = isMinimalTheme ? "text-gray-500" : isPlayfulTheme ? "text-fuchsia-300/80" : "text-gray-600";
  const overallQualityScore = useMemo(() => {
    if (slides.length === 0) return null;
    return Math.round(slides.reduce((sum, slide) => sum + getSlideQuality(slide).score, 0) / slides.length);
  }, [slides]);

  function triggerToast(message: string, durationMs: number) {
    setToastMessage(message);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), durationMs);
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem("themePreset");
    if (storedTheme === "minimal-white" || storedTheme === "dark-modern" || storedTheme === "playful-kids") setThemePreset(storedTheme);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);
  useEffect(() => localStorage.setItem("themePreset", themePreset), [themePreset]);

  const fetchHistoryProjects = async () => {
    if (!isSupabaseConfigured) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, idea, tone, format, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) {
        console.error("Supabase history fetch failed:", error);
        setHistoryError("Could not load history.");
        return;
      }
      const normalized = (data || []).map((project) => ({
        id: String(project.id),
        idea: String(project.idea || ""),
        tone: project.tone === "Emotional" || project.tone === "Storytelling" ? project.tone : "Educational",
        format:
          project.format === "post" || project.format === "story" || project.format === "carousel"
            ? project.format
            : "carousel",
        created_at: String(project.created_at || new Date().toISOString()),
      })) as ProjectHistoryItem[];
      setHistoryProjects(normalized);
    } catch (error) {
      console.error("Supabase history fetch exception:", error);
      setHistoryError("Could not load history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void fetchHistoryProjects();
  }, []);

  useEffect(() => {
    if (showHistoryPanel) {
      void fetchHistoryProjects();
    }
  }, [showHistoryPanel]);

  const applyThemePreset = (presetId: ThemePresetId) => {
    const nextTheme = themePresets[presetId];
    setThemePreset(presetId);
    setBrand((prev) => ({ ...prev, primaryColor: nextTheme.primaryColor, secondaryColor: nextTheme.secondaryColor, fontStyle: nextTheme.fontStyle }));
    setNotice(`${nextTheme.label} theme applied.`);
  };
  const updateSlideField = (index: number, field: "title" | "body", value: string) => {
    setSlides((prev) => prev.map((slide, i) => (i === index ? { ...slide, [field]: value } : slide)));
    setEditedSlides((prev) => ({ ...prev, [index]: true }));
  };
  const copySlideText = async (index: number) => {
    const slide = slides[index];
    if (!slide) return;
    try {
      await navigator.clipboard.writeText(`${slide.title}\n\n${slide.body}`);
      setCopiedIndex(index);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      setNotice("Could not copy text. Please copy manually.");
    }
  };
  const applyHookVariation = (hookTitle: string) => {
    setSlides((prev) => prev.map((slide, idx) => (idx === 0 ? { ...slide, title: hookTitle } : slide)));
    setShowHookPicker(false);
    setNotice("Hook updated.");
  };
  const generateHookVariations = async () => {
    if (!idea.trim() || slides.length === 0 || isHookLoading) return;
    setIsHookLoading(true);
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea, tone, hookVariations: true, nonce: Date.now() }) });
      const data = (await response.json()) as { hooks?: string[]; error?: string };
      if (!response.ok) return setNotice(data.error || "Could not generate hook variations.");
      const hooks = Array.isArray(data.hooks) ? data.hooks.slice(0, 3) : [];
      if (hooks.length === 0) return setNotice("No hook variations were returned.");
      setHookOptions(hooks);
      setShowHookPicker(true);
    } catch {
      setNotice("Could not generate hook variations right now.");
    } finally {
      setIsHookLoading(false);
    }
  };

  const saveProject = async (generatedSlides: Slide[]) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          idea,
          tone,
          format,
        })
        .select("id")
        .single();

      if (projectError || !projectData?.id) {
        console.error("Supabase project insert failed:", projectError);
        return;
      }

      const slidesPayload = generatedSlides.map((slide, index) => ({
        project_id: projectData.id,
        title: slide.title,
        body: slide.body,
        type: slide.slideType,
        order_index: index,
      }));

      const { error: slidesError } = await supabase.from("slides").insert(slidesPayload);
      if (slidesError) {
        console.error("Supabase slides insert failed:", slidesError);
        return;
      }
      void fetchHistoryProjects();
    } catch (error) {
      console.error("Supabase saveProject failed:", error);
    }
  };

  const loadProjectFromHistory = async (projectId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const project = historyProjects.find((item) => item.id === projectId);
      if (!project) return;

      const { data, error } = await supabase
        .from("slides")
        .select("title, body, type, order_index")
        .eq("project_id", projectId)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Supabase slides fetch failed:", error);
        setNotice("Could not load selected project.");
        return;
      }

      const loadedSlides: Slide[] = (data || []).map((slide, index) => ({
        title: String(slide.title || ""),
        body: String(slide.body || ""),
        slideType:
          slide.type === "Hook" || slide.type === "CTA" || slide.type === "Content"
            ? slide.type
            : index === 0
              ? "Hook"
              : index === 4
                ? "CTA"
                : "Content",
      }));

      if (loadedSlides.length === 0) {
        setNotice("No slides found for this project.");
        return;
      }

      setIdea(project.idea);
      setTone(project.tone);
      setFormat(project.format as FormatMode);
      setSlides(loadedSlides);
      setSelectedHistoryProjectId(projectId);
      setNotice("Loaded project from history.");
    } catch (error) {
      console.error("Supabase load project failed:", error);
      setNotice("Could not load selected project.");
    }
  };

  const deleteProjectFromHistory = async (projectId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { error: slidesError } = await supabase.from("slides").delete().eq("project_id", projectId);
      if (slidesError) {
        console.error("Supabase delete slides failed:", slidesError);
        setNotice("Could not delete project history.");
        return;
      }
      const { error: projectError } = await supabase.from("projects").delete().eq("id", projectId);
      if (projectError) {
        console.error("Supabase delete project failed:", projectError);
        setNotice("Could not delete project history.");
        return;
      }
      setHistoryProjects((prev) => prev.filter((item) => item.id !== projectId));
      if (selectedHistoryProjectId === projectId) {
        setSelectedHistoryProjectId(null);
      }
      setNotice("History item deleted.");
      void fetchHistoryProjects();
    } catch (error) {
      console.error("Supabase delete project exception:", error);
      setNotice("Could not delete project history.");
    }
  };

  const deleteAllHistory = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { error: slidesError } = await supabase.from("slides").delete().not("project_id", "is", null);
      if (slidesError) {
        console.error("Supabase delete all slides failed:", slidesError);
        setNotice("Could not delete history.");
        return;
      }
      const { error: projectsError } = await supabase.from("projects").delete().not("id", "is", null);
      if (projectsError) {
        console.error("Supabase delete all projects failed:", projectsError);
        setNotice("Could not delete history.");
        return;
      }
      setHistoryProjects([]);
      setSelectedHistoryProjectId(null);
      setNotice("All history deleted.");
      void fetchHistoryProjects();
    } catch (error) {
      console.error("Supabase delete all history exception:", error);
      setNotice("Could not delete history.");
    }
  };

  void editedSlides;

  return (
    <main className="min-h-screen" style={{ fontFamily: fontFamilyMap[brand.fontStyle], backgroundColor: pageBg }}>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className={`mb-2 text-center text-4xl font-bold sm:text-5xl ${headingClass}`}>✦ Carousel Studio</h1>
        <p className="text-center text-base text-gray-400">Turn any idea into a ready-to-post Instagram carousel</p>
        <div className="mb-12 mt-4 h-px bg-gradient-to-r from-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${brand.primaryColor}, transparent)` }} />

        <IdeaInput
          idea={idea}
          setIdea={setIdea}
          tone={tone}
          format={format}
          setFormat={setFormat}
          template={template}
          setTemplate={setTemplate}
          isLoading={isLoading}
          onGenerate={() =>
            generateSlides({
              idea,
              tone,
              format,
              template: contentTemplates.find((item) => item.id === template) || contentTemplates[0],
              onBeforeGenerate: () => {
                setShowHookPicker(false);
                setHookOptions([]);
                setEditing(null);
                setEditedSlides({});
              },
              onSuccess: (generatedSlides) => {
                triggerToast("✓ Carousel ready!", 2000);
                void saveProject(generatedSlides);
              },
            })
          }
          brand={brand}
          themePreset={themePreset}
        />
        <BrandPanel
          brand={brand}
          setBrand={setBrand}
          setTone={setTone}
          onSaveAsNew={saveCurrentAsPreset}
          onReset={resetBrandPreset}
          presets={brandPresets}
          defaultBrandId={defaultBrandId}
          onApplyPreset={applyPreset}
          onRenamePreset={renamePreset}
          onDeletePreset={deletePreset}
          onDuplicatePreset={duplicatePreset}
          onSetDefaultPreset={setDefaultPreset}
          themePreset={themePreset}
          onThemePresetChange={applyThemePreset}
        />
        {showHistoryPanel ? (
          <HistoryPanel
            projects={historyProjects}
            isLoading={historyLoading}
            error={historyError}
            isConfigured={isSupabaseConfigured}
            selectedProjectId={selectedHistoryProjectId}
            onLoadProject={(projectId) => void loadProjectFromHistory(projectId)}
            onDeleteProject={(projectId) => void deleteProjectFromHistory(projectId)}
            onDeleteAll={() => void deleteAllHistory()}
            onClose={() => setShowHistoryPanel(false)}
            themePreset={themePreset}
          />
        ) : (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowHistoryPanel(true)}
              className={`rounded-xl px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border border-gray-300 text-gray-800 hover:border-black hover:text-black" : isPlayfulTheme ? "border border-pink-300/40 text-pink-100 hover:border-pink-300 hover:text-white" : "border border-gray-700 text-gray-300 hover:border-purple-500 hover:text-purple-400"}`}
            >
              Show History
            </button>
          </div>
        )}

        {notice && !notice.toLowerCase().includes("smart local ai fallback") ? <div className={`mb-6 rounded-xl px-4 py-3 text-sm ${isMinimalTheme ? "border border-black/10 bg-black/[0.03] text-gray-800" : isPlayfulTheme ? "border border-pink-300/30 bg-pink-400/10 text-pink-100" : "border border-white/10 bg-white/5 text-gray-300"}`}>{notice}</div> : null}

        {slides.length === 0 ? (
          <section className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="mb-3 text-5xl">🎨</div>
            <p className={`text-lg ${subHeadingClass}`}>Your carousel will appear here</p>
            <p className={`mt-1 text-sm ${mutedTextClass}`}>Describe your idea above and hit Generate</p>
          </section>
        ) : (
          <CarouselCanvas
            slides={slides}
            format={format}
            brand={brand}
            exportMode={exportMode}
            setExportMode={setExportMode}
            viewMode={viewMode}
            setViewMode={setViewMode}
            slideRefs={slideRefs}
            onDownloadAll={downloadAll}
            overallQualityScore={overallQualityScore}
            loadingIndex={loadingIndex}
            copiedIndex={copiedIndex}
            editing={editing}
            onEdit={setEditing}
            onRegenerate={(index) => regenerateSlide({ index, idea, tone, format, onSuccess: (idx) => setEditedSlides((prev) => ({ ...prev, [idx]: false })) })}
            onDownload={(index) => void downloadSlide(index)}
            onCopy={(index) => void copySlideText(index)}
            onUpdateField={updateSlideField}
            themePreset={themePreset}
            isHookLoading={isHookLoading}
            showHookPicker={showHookPicker}
            hookOptions={hookOptions}
            onGenerateHooks={() => void generateHookVariations()}
            onApplyHook={applyHookVariation}
          />
        )}

        <footer className={`mt-16 pb-8 text-center text-xs ${isMinimalTheme ? "text-gray-600" : isPlayfulTheme ? "text-pink-100/80" : "text-gray-700"}`}>
          ✦ {genCount} carousels created with Carousel Studio
          <div className={`mt-2 ${isMinimalTheme ? "text-gray-500" : isPlayfulTheme ? "text-pink-200/80" : "text-gray-800"}`}>Built for Cuemath AI Builder Challenge</div>
        </footer>
      </div>
      {showToast ? <div className="fixed bottom-6 right-6 z-50 animate-[toastFadeIn_0.25s_ease] rounded-xl border border-green-700 bg-green-900 px-4 py-2 text-sm text-green-300">{toastMessage}</div> : null}
    </main>
  );
}
