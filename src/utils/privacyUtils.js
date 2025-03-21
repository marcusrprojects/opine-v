import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { USER_PRIVACY, CATEGORY_PRIVACY } from "../constants/privacy";

export async function getVisibleCategoriesForUser(creatorId, viewerId) {
  const creatorDoc = await getDoc(doc(db, "users", creatorId));
  if (!creatorDoc.exists()) return [];
  const { creatorPrivacy } = creatorDoc.data();

  let categoriesQuery;
  if (viewerId === creatorId) {
    // The creator sees all categories
    categoriesQuery = query(
      collection(db, "categories"),
      where("createdBy", "==", creatorId)
    );
  } else if (creatorPrivacy === USER_PRIVACY.PUBLIC) {
    // For a public account, show categories unless they are marked as "only-me"
    categoriesQuery = query(
      collection(db, "categories"),
      where("createdBy", "==", creatorId),
      where("categoryPrivacy", "!=", CATEGORY_PRIVACY.ONLY_ME)
    );
  } else if (creatorPrivacy === USER_PRIVACY.PRIVATE) {
    // For a private account, the viewer must be an approved follower.
    // (Assume the user’s document has a `followers` array.)
    const creatorData = creatorDoc.data();
    if (!creatorData.followers || !creatorData.followers.includes(viewerId)) {
      return []; // Viewer isn’t allowed
    }
    categoriesQuery = query(
      collection(db, "categories"),
      where("createdBy", "==", creatorId),
      where("categoryPrivacy", "!=", CATEGORY_PRIVACY.ONLY_ME)
    );
  } else {
    // Fallback: return no categories
    return [];
  }

  const querySnapshot = await getDocs(categoriesQuery);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Updates the privacy setting of all categories created by a specific user.
 * @param {string} userId - The ID of the user whose categories should be updated.
 * @param {string} newPrivacy - The new privacy setting to apply.
 */
export const updateUserCategoriesPrivacy = async (userId, newPrivacy) => {
  try {
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, where("createdBy", "==", userId));
    const categorySnapshots = await getDocs(q);

    if (categorySnapshots.empty) return; // No categories to update

    // Use a batch to update all categories
    const batch = writeBatch(db);
    categorySnapshots.docs.forEach((docSnap) => {
      batch.update(doc(db, "categories", docSnap.id), {
        creatorPrivacy: newPrivacy,
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error updating categories' privacy:", error);
    throw error; // Allow caller to handle errors if needed
  }
};
