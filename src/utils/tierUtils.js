// Fixed pool of possible IDs (for up to 10 tiers).
const POSSIBLE_TIER_IDS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

/**
 * Generates a unique tier id given an array of used ids.
 * If available, uses a fixed pool (for efficiency). If all are taken,
 * falls back to crypto.randomUUID() or a random string.
 * @param {Array} usedIds - An array of IDs already in use.
 * @returns {string} A unique tier id.
 */
export const generateUniqueTierId = (usedIds) => {
  for (const id of POSSIBLE_TIER_IDS) {
    if (!usedIds.includes(id)) {
      return id;
    }
  }
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    let newId;
    do {
      newId = crypto.randomUUID();
    } while (usedIds.includes(newId));
    return newId;
  }
  const generate = () => Math.random().toString(36).substr(2, 8);
  let newId;
  do {
    newId = generate();
  } while (usedIds.includes(newId));
  return newId;
};
