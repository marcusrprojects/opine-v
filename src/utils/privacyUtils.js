import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { UserPrivacy, CategoryPrivacy } from "../enums/PrivacyEnums";

export async function getVisibleCategoriesForUser(creatorId, viewerId) {
  const creatorDoc = await getDoc(doc(db, "users", creatorId));
  if (!creatorDoc.exists()) return [];
  const { creatorPrivacy } = creatorDoc.data();

  let categoriesQuery;
  if (viewerId === creatorId) {
    // The creator sees all categories
    categoriesQuery = query(
      collection(db, "categories"),
      where("createdBy", "==", creatorId),
      orderBy("updatedAt", "desc")
    );
  } else if (creatorPrivacy === UserPrivacy.PUBLIC) {
    // For a public account, show categories unless they are marked as "only-me"
    categoriesQuery = query(
      collection(db, "categories"),
      where("createdBy", "==", creatorId),
      where("categoryPrivacy", "!=", CategoryPrivacy.ONLY_ME),
      orderBy("updatedAt", "desc")
    );
  } else if (creatorPrivacy === UserPrivacy.PRIVATE) {
    // For a private account, the viewer must be an approved follower.
    // (Assume the user’s document has a `followers` array.)
    const creatorData = creatorDoc.data();
    if (!creatorData.followers || !creatorData.followers.includes(viewerId)) {
      return []; // Viewer isn’t allowed
    }
    categoriesQuery = query(
      collection(db, "categories"),
      where("createdBy", "==", creatorId),
      where("categoryPrivacy", "!=", CategoryPrivacy.ONLY_ME),
      orderBy("updatedAt", "desc")
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

// must be called only if (!category || !user) return; check isn't returned from.
export const canUserViewCategory = (category, user, following) => {
  const isCreator = user.uid === category.createdBy;
  const isFollower = following.has(category.createdBy);

  const categoryIsPublic = category.categoryPrivacy === CategoryPrivacy.DEFAULT;
  const userIsPublic = category.creatorPrivacy === UserPrivacy.PUBLIC;

  return (
    isCreator ||
    (userIsPublic && categoryIsPublic) ||
    (isFollower && categoryIsPublic)
  );
};
