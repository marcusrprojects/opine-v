export const DEFAULT_TIER_PRESETS = [
  {
    id: "good-ok-bad",
    name: "Good / Okay / Bad",
    tiers: [
      { name: "Bad", color: "#F44336", cutoff: 0 },
      { name: "Okay", color: "#FFC107", cutoff: 3.33 },
      { name: "Good", color: "#4CAF50", cutoff: 6.66 },
    ],
  },
  {
    id: "s-f-tier",
    name: "S—F Tier",
    tiers: [
      { name: "F", color: "#B10DC9", cutoff: 0 },
      { name: "D", color: "#0074D9", cutoff: 3 },
      { name: "C", color: "#2ECC40", cutoff: 4.5 },
      { name: "B", color: "#FFDC00", cutoff: 6 },
      { name: "A", color: "#FF851B", cutoff: 7.5 },
      { name: "S", color: "#FF4136", cutoff: 9.17 },
    ],
  },
  {
    id: "very-good-to-bad",
    name: "Very Good → Very Bad",
    tiers: [
      { name: "Very Bad", color: "#F44336", cutoff: 0 },
      { name: "Bad", color: "#FF9800", cutoff: 2 },
      { name: "Okay", color: "#FFEB3B", cutoff: 4 },
      { name: "Good", color: "#00BCD4", cutoff: 6 },
      { name: "Very Good", color: "#4CAF50", cutoff: 8 },
    ],
  },
  {
    id: "numeric-1-10",
    name: "1 to 10 Scale",
    tiers: Array.from({ length: 10 }, (_, i) => ({
      name: `${i + 1}`,
      color: `hsl(${((9 - i) / 10) * 120}, 70%, 50%)`,
      cutoff: i,
    })),
  },
];
