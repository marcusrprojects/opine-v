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

/**
 * Calculates a card color for an item based on its rating and the provided tiers.
 *
 * The tiers parameter should be an array of tier objects, each containing:
 *   - name: string
 *   - color: string (the user-selected color)
 *   - cutoff: number (the lower boundary for this tier)
 *
 * Tiers should be sorted in ascending order by cutoff.
 * This function finds the highest tier for which rating >= cutoff.
 */
export const calculateCardColor = (rating, tiers) => {
  if (!tiers || tiers.length === 0) return "#fff";
  let selectedTier = tiers[0];
  for (let i = 0; i < tiers.length; i++) {
    if (rating >= tiers[i].cutoff) {
      selectedTier = tiers[i];
    } else {
      break;
    }
  }
  return selectedTier.color;
};
