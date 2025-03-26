/**
 * Generates a unique tier id based on existing tiers.
 * Uses crypto.randomUUID() if available; otherwise falls back to a simple random string.
 * @param {Array} existingTiers - The array of existing tier objects.
 * @returns {string} A unique tier id.
 */
export const generateUniqueTierId = (existingTiers) => {
  const exists = (id) => existingTiers.some((tier) => tier.id === id);

  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    let id;
    do {
      id = crypto.randomUUID();
    } while (exists(id));
    return id;
  } else {
    const generate = () => Math.random().toString(36).substr(2, 8);
    let id;
    do {
      id = generate();
    } while (exists(id));
    return id;
  }
};
