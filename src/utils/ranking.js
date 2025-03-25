import { db } from "../firebaseConfig";
import {
  writeBatch,
  doc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";

/**
 * Uniformly recalculates ratings for the items array.
 * For n items, if n === 1 the rating is set to 5; otherwise,
 * ratings are uniformly distributed so that the lowest gets 0
 * and the highest gets 10.
 */
const recalcRatings = (items) => {
  // Ensure items are sorted in ascending order by their current rating.
  items.sort((a, b) => a.rating - b.rating);
  const n = items.length;
  if (n === 0) return items;
  if (n === 1) {
    items[0].rating = 5;
  } else {
    items.forEach((item, i) => {
      item.rating = i * (10 / (n - 1));
    });
  }
  return items;
};

/**
 * Writes the given items (with their ratings) to Firestore.
 * The items array is expected to be in the proper ranking order.
 * Ratings will be recalculated uniformly before writing.
 * Optionally updates the category's updatedAt timestamp.
 */
export const writeItemsToFirestore = async (
  categoryId,
  items,
  updateCategoryTimestamp = true
) => {
  // Recalculate ratings uniformly for the provided items.
  const updatedItems = recalcRatings(items);

  const batch = writeBatch(db);
  updatedItems.forEach((item) => {
    const itemRef = item.id
      ? doc(db, `categories/${categoryId}/items`, item.id)
      : doc(collection(db, `categories/${categoryId}/items`));
    if (!item.id) {
      item.id = itemRef.id;
    }
    batch.set(itemRef, item, { merge: true });
  });

  if (updateCategoryTimestamp) {
    const categoryRef = doc(db, "categories", categoryId);
    batch.update(categoryRef, { updatedAt: Timestamp.now() });
  }

  await batch.commit();
};

/**
 * Recalculates the ratings for all items in a category.
 * It fetches the current items, filters those with a numeric rating,
 * recalculates their ratings uniformly, and writes the updated list back.
 */
export const recalcRankingsForCategory = async (categoryId) => {
  const itemsSnapshot = await getDocs(
    collection(db, `categories/${categoryId}/items`)
  );
  let items = itemsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  // Consider only items that have a numeric rating.
  items = items.filter((item) => typeof item.rating === "number");
  if (items.length === 0) return;
  await writeItemsToFirestore(categoryId, items);
};

// Helper: Convert hex color to RGB.
const hexToRGB = (hex) => {
  hex = hex.replace(/^#/, "");
  // Expand shorthand form (e.g. "03F") to full form ("0033FF")
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

/**
 * Given a rating (0–10) and an array of tier objects (each with a name, a hex color, and a cutoff),
 * this function determines the tier the rating belongs to, computes how far into that tier the rating is,
 * and returns a shade of the tier’s base color by adjusting its opacity.
 *
 * It assumes each tier’s cutoff represents the maximum rating for that tier.
 * Opacity is interpolated linearly from minAlpha (at the lower bound) to maxAlpha (at the upper bound).
 */
export const calculateCardColor = (rating, tiers) => {
  if (!tiers || tiers.length === 0) return "#fff";

  // Sort tiers in ascending order by cutoff.
  const sortedTiers = [...tiers].sort((a, b) => a.cutoff - b.cutoff);

  // Find the tier index where rating is less than or equal to the cutoff.
  let tierIndex = sortedTiers.findIndex((tier) => rating <= tier.cutoff);
  if (tierIndex === -1) tierIndex = sortedTiers.length - 1;
  const tier = sortedTiers[tierIndex];

  // Define lower bound for this tier.
  const lowerBound = tierIndex === 0 ? 0 : sortedTiers[tierIndex - 1].cutoff;
  const upperBound = tier.cutoff;

  // Clamp the rating between lowerBound and upperBound.
  const clampedRating = Math.min(Math.max(rating, lowerBound), upperBound);
  const range = upperBound - lowerBound || 1; // Avoid division by zero.
  const ratio = (clampedRating - lowerBound) / range;

  // Define desired alpha range.
  const minAlpha = 0.65; // More transparent at the lower bound.
  const maxAlpha = 1; // Fully opaque at the upper bound.
  const alpha = minAlpha + (maxAlpha - minAlpha) * ratio;

  // Convert the tier's base hex color to RGB.
  const { r, g, b } = hexToRGB(tier.color);

  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
};
