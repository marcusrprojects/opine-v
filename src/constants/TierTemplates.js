export const DEFAULT_TIER_PRESETS = [
  {
    id: "good-ok-bad",
    name: "Good / Okay / Bad",
    tiers: [
      { name: "Good", color: "#4CAF50", cutoff: 6.66 },
      { name: "Okay", color: "#FFC107", cutoff: 3.33 },
      { name: "Bad", color: "#F44336", cutoff: 0 },
    ],
  },
  {
    id: "s-f-tier",
    name: "S / A / B / C / D / F",
    tiers: [
      { name: "S", color: "#FF4136", cutoff: 9.17 },
      { name: "A", color: "#FF851B", cutoff: 7.5 },
      { name: "B", color: "#FFDC00", cutoff: 6 },
      { name: "C", color: "#2ECC40", cutoff: 4.5 },
      { name: "D", color: "#0074D9", cutoff: 3 },
      { name: "F", color: "#B10DC9", cutoff: 0 },
    ],
  },
  {
    id: "top-mid-low",
    name: "Top / Mid / Low",
    tiers: [
      { name: "Top", color: "#00BCD4", cutoff: 6.66 },
      { name: "Mid", color: "#9E9E9E", cutoff: 3.33 },
      { name: "Low", color: "#795548", cutoff: 0 },
    ],
  },
  {
    id: "very-good-to-bad",
    name: "Very Good → Very Bad",
    tiers: [
      { name: "Very Good", color: "#4CAF50", cutoff: 8 },
      { name: "Good", color: "#00BCD4", cutoff: 6 },
      { name: "Okay", color: "#FFEB3B", cutoff: 4 },
      { name: "Bad", color: "#FF9800", cutoff: 2 },
      { name: "Very Bad", color: "#F44336", cutoff: 0 },
    ],
  },
  {
    id: "numeric-1-10",
    name: "1 to 10 Scale",
    tiers: Array.from({ length: 10 }, (_, i) => ({
      name: `${10 - i}`,
      color: `hsl(${(i / 10) * 120}, 70%, 50%)`,
      cutoff: i,
    })),
  },
];
