// Category color map for episode markers

export type CategoryColors = {
  bg: string;    // marker background (semi-transparent)
  ring: string;  // border / glow color (opaque hex)
};

export const CATEGORY_COLORS: Record<string, CategoryColors> = {
  Technology:             { bg: "rgba(59,130,246,0.75)",  ring: "#3b82f6" }, // blue-500
  Gaming:                 { bg: "rgba(139,92,246,0.75)",  ring: "#8b5cf6" }, // violet-500
  Finance:                { bg: "rgba(16,185,129,0.75)",  ring: "#10b981" }, // emerald-500
  "Retail / Consumer":    { bg: "rgba(249,115,22,0.75)",  ring: "#f97316" }, // orange-500
  Healthcare:             { bg: "rgba(20,184,166,0.75)",  ring: "#14b8a6" }, // teal-500
  "Media / Entertainment":{ bg: "rgba(236,72,153,0.75)",  ring: "#ec4899" }, // pink-500
  Energy:                 { bg: "rgba(234,179,8,0.75)",   ring: "#eab308" }, // yellow-500
  "Defense / Aerospace":  { bg: "rgba(100,116,139,0.75)", ring: "#64748b" }, // slate-500
  _default:               { bg: "rgba(107,114,128,0.75)", ring: "#6b7280" }, // gray-500
};
