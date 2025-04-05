// Simple ID generator using current time and a random number.
export const generateId = () =>
  `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
