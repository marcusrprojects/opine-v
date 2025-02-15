import { db } from "../firebaseConfig";
import { writeBatch, doc, collection, getDocs } from "firebase/firestore";
import RankCategory from "../enums/RankCategory";

export const writeItemsToFirestore = async (
  categoryId,
  items,
  rankCategory
) => {
  const totalRange = (1 / 3) * 10; // Each category gets a third of the 10-point range

  // Dynamic offset: The first item should not start at the exact lower boundary
  const dynamicOffset = totalRange / items.length;
  console.log("Dynamic offset: ", dynamicOffset);

  const minRating =
    rankCategory === RankCategory.GOOD
      ? (2 / 3) * 10
      : rankCategory === RankCategory.OKAY
      ? (1 / 3) * 10
      : 0;

  if (items.length === 1) {
    items[0].rating = minRating + totalRange / 2; // Single item is placed in the middle
  } else {
    rankCategory += dynamicOffset;
    // Adjust ratings dynamically within the category range
    items.forEach((item, index) => {
      item.rating = minRating + index * dynamicOffset;
    });
  }

  // Write batch to Firestore
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
