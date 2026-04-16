export type SlideType = "Hook" | "Content" | "CTA";
export type TemplateId = "auto" | "5-tips" | "myth-fact" | "before-after";

export type Slide = {
  title: string;
  body: string;
  slideType: SlideType;
};

export type FormatMode = "post" | "story" | "carousel";
export type BrandTone = "Educational" | "Emotional" | "Storytelling";
export type BrandFont = "Inter" | "System" | "Serif";
export type ThemePresetId = "minimal-white" | "dark-modern" | "playful-kids";
export type SlideQualityLabel = "weak" | "ok" | "great";
export type ContentTemplate = {
  id: TemplateId;
  name: string;
  structure: string;
};
export type ProjectHistoryItem = {
  id: string;
  idea: string;
  tone: BrandTone;
  format: FormatMode;
  created_at: string;
};

export type BrandPreset = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  fontStyle: BrandFont;
  tone: BrandTone;
  createdAt: number;
};

export type ThemePreset = {
  label: string;
  primaryColor: string;
  secondaryColor: string;
  accentPalette: string[];
  fontStyle: BrandFont;
};

export const themePresets: Record<ThemePresetId, ThemePreset> = {
  "minimal-white": {
    label: "Minimal White",
    primaryColor: "#111111",
    secondaryColor: "#6b7280",
    accentPalette: ["#111111", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db"],
    fontStyle: "Inter",
  },
  "dark-modern": {
    label: "Dark Modern",
    primaryColor: "#7c3aed",
    secondaryColor: "#06b6d4",
    accentPalette: ["#4338ca", "#0ea5e9", "#06b6d4", "#10b981", "#a855f7"],
    fontStyle: "Inter",
  },
  "playful-kids": {
    label: "Playful Kids",
    primaryColor: "#f97316",
    secondaryColor: "#ec4899",
    accentPalette: ["#22c55e", "#06b6d4", "#f97316", "#ec4899", "#eab308"],
    fontStyle: "System",
  },
};

export const defaultBrandPreset: BrandPreset = {
  id: "default-cuemath",
  name: "Cuemath Default",
  primaryColor: "#7c3aed",
  secondaryColor: "#ec4899",
  fontStyle: "Inter",
  tone: "Educational",
  createdAt: 0,
};

export const fontFamilyMap: Record<BrandFont, string> = {
  Inter: "Inter, sans-serif",
  System: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  Serif: "ui-serif, Georgia, Cambria, Times New Roman, serif",
};

export const ideaChips = [
  "💡 Why kids forget what they learn",
  "📚 5 signs your child needs help",
  "🧠 What spaced repetition means",
];

export const contentTemplates: ContentTemplate[] = [
  { id: "auto", name: "Auto", structure: "" },
  { id: "5-tips", name: "5 Tips", structure: "Slide 1: Hook, Slide 2-4: Tips, Slide 5: CTA" },
  { id: "myth-fact", name: "Myth vs Fact", structure: "Slide 1: Hook, Slide 2: Myth, Slide 3: Truth, Slide 4: Explanation, Slide 5: CTA" },
  { id: "before-after", name: "Before vs After", structure: "Slide 1: Hook, Slide 2: Before, Slide 3: Pain, Slide 4: After, Slide 5: CTA" },
];

export const formatConfig: Record<
  FormatMode,
  { label: string; displayWidth: number; displayHeight: number; exportWidth: number; exportHeight: number }
> = {
  post: { label: "1:1 Post", displayWidth: 420, displayHeight: 420, exportWidth: 1080, exportHeight: 1080 },
  story: { label: "9:16 Story", displayWidth: 300, displayHeight: 533, exportWidth: 1080, exportHeight: 1920 },
  carousel: { label: "Carousel", displayWidth: 320, displayHeight: 320, exportWidth: 1080, exportHeight: 1080 },
};

export function getSlideQuality(slide: { title: string; body: string }): { score: number; label: string; color: string } {
  let score = 100;
  const title = slide.title;
  const body = slide.body;
  const wordCount = body.split(" ").filter(Boolean).length;

  if (title.toLowerCase().startsWith("reason") && title.includes(":")) score -= 30;
  if (title.split(" ").length > 9) score -= 15;
  if (wordCount > 35) score -= 20;
  if (wordCount < 6) score -= 25;
  if (body.toLowerCase().includes("in today's world")) score -= 30;
  if (body.toLowerCase().includes("it is important to")) score -= 30;
  if (title.toLowerCase() === title) score -= 10;

  if (score >= 80) return { score, label: "Great", color: "text-green-400" };
  if (score >= 55) return { score, label: "Good", color: "text-yellow-400" };
  return { score, label: "Weak", color: "text-red-400" };
}

export function getQualityLabel(score: number): SlideQualityLabel {
  if (score >= 80) return "great";
  if (score >= 55) return "ok";
  return "weak";
}
