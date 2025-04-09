import admin from "firebase-admin";
import {
  writeBatch,
  collection,
  Timestamp,
  doc,
  getDocs,
} from "firebase-admin/firestore";

/**
 * Uniformly recalculates ratings for a group of items.
 * If there's one item, it sets its rating to the upperBound.
 * Otherwise, it distributes ratings evenly between lowerBound and upperBound.
 */
export const recalcRatingsForGroup = (group, lowerBound, upperBound) => {
  const n = group.length;
  if (n === 0) return;
  if (n === 1) {
    group[0].rating = upperBound;
  } else {
    const dynamicOffset = (upperBound - lowerBound) / n;
    group.forEach((item, index) => {
      item.rating = lowerBound + (index + 1) * dynamicOffset;
    });
  }
};

/**
 * Recalculates the ranking for all items in a category based on new tier cutoffs.
 * newTiers should be an array of tier objects with at least { id, cutoff } fields.
 */
export const recalcAllRankingsForCategoryByRating = async (
  categoryId,
  newTiers
) => {
  const db = admin.firestore();
  const itemsSnapshot = await getDocs(
    collection(db, `categories/${categoryId}/items`)
  );
  const items = itemsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  if (items.length === 0) return;

  const sortedTiers = [...newTiers].sort((a, b) => a.cutoff - b.cutoff);
  const groups = {};
  for (const item of items) {
    const oldRating = item.rating || 0;
    let assignedTier = sortedTiers[sortedTiers.length - 1];
    for (const tier of sortedTiers) {
      if (oldRating <= tier.cutoff) {
        assignedTier = tier;
        break;
      }
    }
    if (!groups[assignedTier.id]) groups[assignedTier.id] = [];
    groups[assignedTier.id].push(item);
  }

  const batch = writeBatch(db);
  sortedTiers.forEach((tier, index) => {
    const lowerBound = index === 0 ? 0 : sortedTiers[index - 1].cutoff;
    const group = groups[tier.id] || [];
    if (group.length === 0) return;
    group.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    recalcRatingsForGroup(group, lowerBound, tier.cutoff);
    group.forEach((item) => {
      item.rankCategory = tier.id;
      const itemRef = doc(db, `categories/${categoryId}/items`, item.id);
      batch.set(itemRef, item, { merge: true });
    });
  });

  const categoryRef = doc(db, "categories", categoryId);
  batch.update(categoryRef, { updatedAt: Timestamp.now() });
  await batch.commit();
};
