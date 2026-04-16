"use client";

import { ProjectHistoryItem, ThemePresetId } from "../types";

type HistoryPanelProps = {
  projects: ProjectHistoryItem[];
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  selectedProjectId: string | null;
  onLoadProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDeleteAll: () => void;
  onClose: () => void;
  themePreset: ThemePresetId;
};

export default function HistoryPanel({
  projects,
  isLoading,
  error,
  isConfigured,
  selectedProjectId,
  onLoadProject,
  onDeleteProject,
  onDeleteAll,
  onClose,
  themePreset,
}: HistoryPanelProps) {
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
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${headingClass}`}>History</h3>
          {isLoading ? <span className={`text-[11px] ${mutedTextClass}`}>Refreshing...</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDeleteAll}
            className={`rounded-md border px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border-red-200 text-red-600 hover:border-red-300" : "border-red-500/30 text-red-300 hover:border-red-400/50"}`}
          >
            Delete All
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history panel"
            className={`rounded-md border px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border-gray-300 text-gray-700 hover:border-gray-400" : "border-gray-700 text-gray-300 hover:border-gray-600"}`}
          >
            ✕
          </button>
        </div>
      </div>
      {!isConfigured ? (
        <p className={`text-xs ${mutedTextClass}`}>
          Supabase is not configured. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable history.
        </p>
      ) : isLoading ? (
        <p className={`text-xs ${mutedTextClass}`}>Loading recent projects...</p>
      ) : error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : projects.length === 0 ? (
        <p className={`text-xs ${mutedTextClass}`}>No saved projects yet.</p>
      ) : (
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {projects.map((project) => {
            const isActive = project.id === selectedProjectId;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onLoadProject(project.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                  isActive
                    ? "border-purple-500/70 bg-purple-500/10"
                    : isMinimalTheme
                      ? "border-gray-300 bg-gray-50 hover:border-gray-400"
                      : isPlayfulTheme
                        ? "border-pink-300/30 bg-[#2b1650] hover:border-pink-300/60"
                        : "border-gray-800 bg-[#1a1a1a] hover:border-gray-700"
                }`}
              >
                <p className={`truncate text-sm ${headingClass}`}>{project.idea || "Untitled idea"}</p>
                <p className={`mt-1 ${mutedTextClass}`}>
                  {new Date(project.created_at).toLocaleString()} • {project.format}
                </p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteProject(project.id);
                    }}
                    className={`rounded-md border px-2 py-1 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${isMinimalTheme ? "border-red-200 text-red-600 hover:border-red-300" : "border-red-500/30 text-red-300 hover:border-red-400/50"}`}
                  >
                    Delete
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
