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
 * Recalculates ratings for items belonging to a specific tier.
 * It looks up the tier boundaries using the full tiers array and then delegates
 * the rating recalculation to recalcRatingsForGroup.
 *
 * @param {Array} items - Items belonging to the selected tier.
 * @param {string} selectedTierId - The unique id of the tier selected.
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
  const lowerBound = index > 0 ? sortedTiers[index - 1].cutoff : 0;
  const upperBound = sortedTiers[index].cutoff;
  recalcRatingsForGroup(items, lowerBound, upperBound);
  return items;
};

/**
 * Uniformly recalculates ratings for items within the boundaries defined
 * by lowerBound and upperBound. For N items:
 *   - If N === 1, the rating is set to the upper bound.
 *   - Otherwise, dynamicOffset = (upperBound - lowerBound) / N, and for each item i (0-indexed):
 *       rating = lowerBound + (i + 1) * dynamicOffset.
 *
 * @param {Array} group - Array of items to update.
 * @param {number} lowerBound - Lower bound for the tier.
 * @param {number} upperBound - Upper bound for the tier.
 */
const recalcRatingsForGroup = (group, lowerBound, upperBound) => {
  const n = group.length;
  if (n === 0) return;
  if (n === 1) {
    group[0].rating = upperBound;
  } else {
    const dynamicOffset = (upperBound - lowerBound) / n;
    // Update each item in the group.
    group.forEach((item, index) => {
      // (index+1) ensures the lowest item gets a value above lowerBound
      // and the highest equals upperBound.
      item.rating = lowerBound + (index + 1) * dynamicOffset;
    });
  }
};

/**
 * Recalculates the ranking for all items in a category based on their old ratings.
 * Items are assigned to tiers based on the new tier cutoffs.
 * @param {string} categoryId - The category's document ID.
 * @param {Array} newTiers - Array of new tier objects, each with an 'id' and a numeric 'cutoff'.
 */
export const recalcAllRankingsForCategoryByRating = async (
  categoryId,
  newTiers
) => {
  // 1. Fetch all items.
  const itemsSnapshot = await getDocs(
    collection(db, `categories/${categoryId}/items`)
  );
  const items = itemsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  if (items.length === 0) return;

  // 2. Sort new tiers ascending (lowest cutoff first).
  const sortedTiers = [...newTiers].sort((a, b) => a.cutoff - b.cutoff);

  // 3. Group items by assigning them based on their old rating.
  // For each item, find the first tier where rating <= tier.cutoff. If none, assign to last tier.
  const groups = {}; // key: tier.id, value: array of items
  for (const item of items) {
    const oldRating = item.rating ?? 0;
    let assignedTier = sortedTiers[sortedTiers.length - 1]; // default to last tier.
    for (const tier of sortedTiers) {
      if (oldRating <= tier.cutoff) {
        assignedTier = tier;
        break;
      }
    }
    if (!groups[assignedTier.id]) groups[assignedTier.id] = [];
    groups[assignedTier.id].push(item);
  }

  // 4. For each group, recalc ratings uniformly within the tier's boundaries.
  // The boundaries: lowerBound is the previous tier's cutoff (or 0 if first); upperBound is the current tier's cutoff.
  const batch = writeBatch(db);
  sortedTiers.forEach((tier, index) => {
    const lowerBound = index === 0 ? 0 : sortedTiers[index - 1].cutoff;
    const upperBound = tier.cutoff;
    const group = groups[tier.id] || [];
    if (group.length === 0) return;
    // Sort group by old rating descending.
    group.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    recalcRatingsForGroup(group, lowerBound, upperBound);
    // Update each item with the new rating and assign new tier id.
    group.forEach((item) => {
      item.rankCategory = tier.id;
      const itemRef = doc(db, `categories/${categoryId}/items`, item.id);
      batch.set(itemRef, item, { merge: true });
    });
  });

  // 5. Update the category's updatedAt timestamp.
  const categoryRef = doc(db, "categories", categoryId);
  batch.update(categoryRef, { updatedAt: Timestamp.now() });

  // Commit the batch.
  await batch.commit();
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
