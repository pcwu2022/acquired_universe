// Category color map for episode markers

export type CategoryColors = {
  bg: string;    // marker background (semi-transparent)
  ring: string;  // border / glow color (opaque hex)
};

export const CATEGORY_COLORS: Record<string, CategoryColors> = {
  Technology:       { bg: "rgba(59,130,246,0.75)",   ring: "#3b82f6" },   // blue-500
  Finance:          { bg: "rgba(34,197,94,0.75)",    ring: "#22c55e" },   // green-500
  Gaming:           { bg: "rgba(139,92,246,0.75)",   ring: "#8b5cf6" },   // violet-500
  Retail:           { bg: "rgba(249,115,22,0.75)",   ring: "#f97316" },   // orange-500
  Media:            { bg: "rgba(236,72,153,0.75)",   ring: "#ec4899" },   // pink-500
  Entertainment:    { bg: "rgba(217,70,239,0.75)",   ring: "#d946ef" },   // fuchsia-500
  "E-commerce":     { bg: "rgba(14,165,233,0.75)",   ring: "#0ea5e9" },   // sky-500
  Transportation:   { bg: "rgba(244,63,94,0.75)",    ring: "#f43f5e" },   // rose-500
  Luxury:           { bg: "rgba(251,146,60,0.75)",   ring: "#fb923c" },   // orange-400
  Sports:           { bg: "rgba(20,184,166,0.75)",   ring: "#14b8a6" },   // teal-500
  Energy:           { bg: "rgba(234,179,8,0.75)",    ring: "#eab308" },   // yellow-500
  Aerospace:        { bg: "rgba(100,116,139,0.75)",  ring: "#64748b" },   // slate-500
  _default:         { bg: "rgba(107,114,128,0.75)",  ring: "#6b7280" },   // gray-500
};
