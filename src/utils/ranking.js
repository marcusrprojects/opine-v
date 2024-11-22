import { db } from "../firebaseConfig";
import { writeBatch, doc, collection, getDocs } from "firebase/firestore";
import RankCategory from "../enums/RankCategory";

// Helper function to write items to Firestore with adjusted ratings
export const writeItemsToFirestore = async (
  categoryId,
  items,
  rankCategory
) => {
  const totalRange = (1 / 3) * 10;
  const minRating =
    rankCategory === RankCategory.GOOD
      ? totalRange * 2
      : rankCategory === RankCategory.OKAY
      ? totalRange
      : 0;

  // Check if there is only one item and assign it a middle rating directly
  if (items.length === 1) {
    items[0].rating = minRating + totalRange / 2;
  } else {
    // Adjust ratings for multiple items
    items.forEach((item, index) => {
      item.rating = minRating + (totalRange / (items.length - 1)) * index;
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
