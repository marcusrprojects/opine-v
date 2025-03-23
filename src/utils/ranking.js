import { db } from "../firebaseConfig";
import {
  writeBatch,
  doc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import RankCategory from "../enums/RankCategory";

export const writeItemsToFirestore = async (
  categoryId,
  items,
  rankCategory,
  updateCategoryTimestamp = true
) => {
  const totalRange = (1 / 3) * 10;
  const dynamicOffset = totalRange / items.length;
  const minRating =
    rankCategory === RankCategory.GOOD
      ? (2 / 3) * 10
      : rankCategory === RankCategory.OKAY
      ? (1 / 3) * 10
      : 0;

  if (items.length === 1) {
    items[0].rating = minRating + totalRange / 2;
  } else {
    rankCategory += dynamicOffset;
    items.forEach((item, index) => {
      item.rating = minRating + index * dynamicOffset;
    });
  }

  const batch = writeBatch(db);
  items.forEach((item) => {
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

// Refresh rankings within a category after a deletion or edit
export const refreshRankedItems = async (categoryId, rankCategory) => {
  const itemsSnapshot = await getDocs(
    collection(db, `categories/${categoryId}/items`)
  );
  const rankedItems = itemsSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((item) => item.rankCategory === rankCategory)
    .sort((a, b) => a.rating - b.rating);

  await writeItemsToFirestore(categoryId, rankedItems, rankCategory);
};

export const calculateCardColor = (rating, rankCategory) => {
  const maxWhite = 50;
  const hues = [0, 60, 120];
  const thresholds = [0, (1 / 3) * 10, (2 / 3) * 10];
  const adjustedWhiteness =
    maxWhite - (rating - thresholds[rankCategory]) * (50 / 3);
  return `hwb(${hues[rankCategory]} ${adjustedWhiteness}% 17.5%)`;
};
