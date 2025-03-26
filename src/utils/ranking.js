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
 * Uniformly recalculates ratings for items within the boundaries defined by the selected tier.
 * The lower bound is 0 or the previous tier's cutoff; the upper bound is the selected tier's cutoff.
 *
 * @param {Array} items - Items belonging to the selected tier.
 * @param {Object} selectedTier - The tier object selected by the user.
 * @param {Array} allTiers - The full tiers array from the category, sorted ascending by cutoff.
 * @returns {Array} items with recalculated ratings.
 */
const recalcRatings = (items, selectedTier, allTiers) => {
  const sortedTiers = [...allTiers].sort((a, b) => a.cutoff - b.cutoff);
  const index = sortedTiers.findIndex((t) => t.id === selectedTier.id);
  const lowerBound = index > 0 ? sortedTiers[index - 1].cutoff : 0;
  const upperBound = selectedTier.cutoff;
  const n = items.length;
  if (n === 0) return items;
  const range = upperBound - lowerBound;
  if (n === 1) {
    items[0].rating = lowerBound + range / 2;
  } else {
    const dynamicOffset = range / (n - 1);
    items.forEach((item, i) => {
      item.rating = lowerBound + i * dynamicOffset;
    });
  }
  return items;
};

/**
 * Writes the given items (with recalculated ratings) to Firestore.
 * The items are assumed to belong to the selected tier.
 * The selectedTier object determines the boundaries.
 */
export const writeItemsToFirestore = async (
  categoryId,
  items,
  selectedTier,
  updateCategoryTimestamp = true
) => {
  // Fetch category document to get the full tiers array.
  const categoryDoc = await getDoc(doc(db, "categories", categoryId));
  let allTiers = [];
  if (categoryDoc.exists()) {
    const data = categoryDoc.data();
    allTiers = data.tiers ?? [];
  }
  const updatedItems = recalcRatings(items, selectedTier, allTiers);
  const batch = writeBatch(db);
  updatedItems.forEach((item) => {
    const itemRef = item.id
      ? doc(db, `categories/${categoryId}/items`, item.id)
      : doc(collection(db, `categories/${categoryId}/items`));
    if (!item.id) {
      item.id = itemRef.id;
    }
    // Store only the unique tier id.
    item.rankCategory = selectedTier.id;
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
export const recalcRankingsForCategory = async (categoryId, selectedTier) => {
  const itemsSnapshot = await getDocs(
    collection(db, `categories/${categoryId}/items`)
  );
  let items = itemsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  // Filter for items that belong to the selected tier (by id) and have a numeric rating.
  items = items.filter(
    (item) =>
      typeof item.rating === "number" && item.rankCategory === selectedTier.id
  );
  if (items.length === 0) return;
  await writeItemsToFirestore(categoryId, items, selectedTier);
};

/**
 * Given an item's rating and the full tiers array, determine which tier the rating falls into,
 * compute its relative position within that tier, and return a shade of that tier’s base color.
 */
export const calculateCardColor = (rating, tiers) => {
  if (!tiers || tiers.length === 0) return "#fff";
  const sortedTiers = [...tiers].sort((a, b) => a.cutoff - b.cutoff);
  let tierIndex = sortedTiers.findIndex((t) => rating <= t.cutoff);
  if (tierIndex === -1) tierIndex = sortedTiers.length - 1;
  const tier = sortedTiers[tierIndex];
  const lowerBound = tierIndex === 0 ? 0 : sortedTiers[tierIndex - 1].cutoff;
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
