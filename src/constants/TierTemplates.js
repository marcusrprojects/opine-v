export const DEFAULT_TIER_PRESETS = [
  {
    id: "good-ok-bad",
    name: "Good / Okay / Bad",
    tiers: [
      { id: "bad", name: "Bad", color: "#F44336", cutoff: 10 / 3 }, // ~3.33
      { id: "okay", name: "Okay", color: "#FFC107", cutoff: (2 * 10) / 3 }, // ~6.67
      { id: "good", name: "Good", color: "#4CAF50", cutoff: 10 },
    ],
  },
  {
    id: "s-f-tier",
    name: "S–F Tier",
    tiers: [
      { id: "f", name: "F", color: "#B10DC9", cutoff: 3 },
      { id: "d", name: "D", color: "#0074D9", cutoff: 3 + 7 / 5 }, // 4.4
      { id: "c", name: "C", color: "#2ECC40", cutoff: 3 + 2 * (7 / 5) }, // 5.8
      { id: "b", name: "B", color: "#FFDC00", cutoff: 3 + 3 * (7 / 5) }, // 7.2
      { id: "a", name: "A", color: "#FF851B", cutoff: 3 + 4 * (7 / 5) }, // 8.6
      { id: "s", name: "S", color: "#FF4136", cutoff: 10 },
    ],
  },
  {
    id: "very-good-to-bad",
    name: "Very Good → Very Bad",
    tiers: [
      { id: "very-bad", name: "Very Bad", color: "#F44336", cutoff: 2 },
      { id: "bad", name: "Bad", color: "#FF9800", cutoff: 4 },
      { id: "okay", name: "Okay", color: "#FFEB3B", cutoff: 6 },
      { id: "good", name: "Good", color: "#00BCD4", cutoff: 8 },
      { id: "very-good", name: "Very Good", color: "#4CAF50", cutoff: 10 },
    ],
  },
  {
    id: "numeric-1-10",
    name: "1 to 10 Scale",
    tiers: Array.from({ length: 10 }, (_, i) => ({
      id: `num-${i + 1}`,
      name: `${i + 1}`,
      color: `hsl(${((9 - i) / 10) * 120}, 70%, 50%)`,
      cutoff: i + 1,
    })),
  },
];
