import { db } from "../firebaseConfig";
import {
  writeBatch,
  doc,
  collection,
  getDocs,
  Timestamp,
  getDoc,
} from "firebase/firestore";

/**
 * Uniformly recalculates ratings for items within the boundaries defined
 * by the selected tier. The lower bound is treated as exclusive and the upper bound as inclusive.
 * For N items:
 *   - If N === 1, the rating is set to the upper bound.
 *   - Otherwise, dynamicOffset = (upperBound - lowerBound) / N, and for each item i (0-indexed):
 *       rating = lowerBound + (i + 1) * dynamicOffset.
 *
 * @param {Array} items - Items belonging to the selected tier.
 * @param {string} selectedTierId - The unique id of the tier selected by the user.
 * @param {Array} allTiers - The full tiers array from the category, sorted ascending by cutoff.
 * @returns {Array} items with recalculated ratings.
 */
const recalcRatings = (items, selectedTierId, allTiers) => {
  const sortedTiers = [...allTiers].sort((a, b) => a.cutoff - b.cutoff);
  const index = sortedTiers.findIndex((t) => t.id === selectedTierId);
  if (index === -1) {
    console.warn("Selected tier id not found:", selectedTierId);
    return items;
  }
  const tierObj = sortedTiers[index];
  // Lower bound is the previous tier's cutoff (if exists); otherwise 0.
  const lowerBound = index > 0 ? sortedTiers[index - 1].cutoff : 0;
  // Upper bound is the selected tier's cutoff.
  const upperBound = tierObj.cutoff;
  const n = items.length;
  if (n === 0) return items;
  const range = upperBound - lowerBound;
  if (n === 1) {
    // For one item, assign the upper bound.
    items[0].rating = upperBound;
  } else {
    const dynamicOffset = range / n;
    items.forEach((item, i) => {
      // Use (i+1) so that the lowest rating is greater than lowerBound and the highest equals upperBound.
      item.rating = lowerBound + (i + 1) * dynamicOffset;
    });
  }
  return items;
};

/**
 * Writes the given items (with recalculated ratings) to Firestore.
 * The items are assumed to belong to the selected tier.
 * The selectedTierId (a string) is used to determine the rating boundaries.
 * Optionally updates the category's updatedAt timestamp.
 */
export const writeItemsToFirestore = async (
  categoryId,
  items,
  selectedTierId,
  updateCategoryTimestamp = true
) => {
  // Fetch the category document to get the full tiers array.
  const categoryDoc = await getDoc(doc(db, "categories", categoryId));
  let allTiers = [];
  if (categoryDoc.exists()) {
    const data = categoryDoc.data();
    allTiers = data.tiers ?? [];
  }
  const updatedItems = recalcRatings(items, selectedTierId, allTiers);
  const batch = writeBatch(db);
  updatedItems.forEach((item) => {
    const itemRef = item.id
      ? doc(db, `categories/${categoryId}/items`, item.id)
      : doc(collection(db, `categories/${categoryId}/items`));
    if (!item.id) {
      item.id = itemRef.id;
    }
    // Store only the unique tier id.
    item.rankCategory = selectedTierId;
    batch.set(itemRef, item, { merge: true });
  });
  if (updateCategoryTimestamp) {
    const categoryRef = doc(db, "categories", categoryId);
    batch.update(categoryRef, { updatedAt: Timestamp.now() });
  }
  await batch.commit();
};

/**
 * Recalculates ratings for all items in a category that belong to a specific tier.
 */
export const recalcRankingsForCategory = async (categoryId, selectedTierId) => {
  const itemsSnapshot = await getDocs(
    collection(db, `categories/${categoryId}/items`)
  );
  let items = itemsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  // Filter for items that belong to the selected tier (by unique id) and have a numeric rating.
  items = items.filter(
    (item) =>
      typeof item.rating === "number" && item.rankCategory === selectedTierId
  );
  if (items.length === 0) return;
  await writeItemsToFirestore(categoryId, items, selectedTierId);
};

/**
 * Given an item's rating and the full tiers array, determines which tier the rating falls into,
 * computes its relative position within that tier, and returns a shade of that tier’s base color.
 * If a storedTierId is provided, it will use that tier directly.
 */
export const calculateCardColor = (rating, tiers, storedTierId) => {
  if (!tiers || tiers.length === 0) return "#fff";
  const sortedTiers = [...tiers].sort((a, b) => a.cutoff - b.cutoff);
  let tier;
  if (storedTierId) {
    tier = sortedTiers.find((t) => t.id === storedTierId);
  }
  if (!tier) {
    let tierIndex = sortedTiers.findIndex((t) => rating <= t.cutoff);
    if (tierIndex === -1) tierIndex = sortedTiers.length - 1;
    tier = sortedTiers[tierIndex];
  }
  const index = sortedTiers.findIndex((t) => t.id === tier.id);
  const lowerBound = index === 0 ? 0 : sortedTiers[index - 1].cutoff;
  const upperBound = tier.cutoff;
  const clampedRating = Math.min(Math.max(rating, lowerBound), upperBound);
  const ratio = (clampedRating - lowerBound) / (upperBound - lowerBound || 1);
  const minAlpha = 0.65;
  const maxAlpha = 1;
  const alpha = minAlpha + (maxAlpha - minAlpha) * ratio;
  const hexToRGB = (hex) => {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { r, g, b };
  };
  const { r, g, b } = hexToRGB(tier.color);
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
};
