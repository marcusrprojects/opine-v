import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import admin from "../firebase.js";

const db = admin.firestore();

export const onUserUpdate = onDocumentUpdated(
  "users/{userId}",
  async (event) => {
    try {
      const beforeSnap = event.data?.before;
      const afterSnap = event.data?.after;
      if (!beforeSnap || !afterSnap) {
        console.error("Missing document snapshots.");
        return;
      }
      const before = beforeSnap.data();
      const after = afterSnap.data();
      const userId = event.params.userId;

      // --- Process follow changes (existing logic)
      const beforeFollowers = before.followers || [];
      const afterFollowers = after.followers || [];
      if (afterFollowers.length > beforeFollowers.length) {
        const newFollowers = afterFollowers.filter(
          (followerId) => !beforeFollowers.includes(followerId)
        );
        for (const followerId of newFollowers) {
          const notification = {
            type: "new_follow",
            fromUser: followerId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            message: "You have a new follower.",
          };
          await db
            .collection("notifications")
            .doc(userId)
            .collection("userNotifications")
            .add(notification);
        }
      }

      // --- Process likedCategories changes
      const beforeLiked = before.likedCategories || [];
      const afterLiked = after.likedCategories || [];

      // Determine which categories were newly liked and which were unliked.
      const addedLikes = afterLiked.filter(
        (catId) => !beforeLiked.includes(catId)
      );
      const removedLikes = beforeLiked.filter(
        (catId) => !afterLiked.includes(catId)
      );

      // Use a batch to update all affected category documents.
      const batch = db.batch();
      for (const categoryId of addedLikes) {
        const categoryRef = db.doc(`categories/${categoryId}`);
        batch.update(categoryRef, {
          likeCount: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      for (const categoryId of removedLikes) {
        const categoryRef = db.doc(`categories/${categoryId}`);
        batch.update(categoryRef, {
          likeCount: admin.firestore.FieldValue.increment(-1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      if (addedLikes.length > 0 || removedLikes.length > 0) {
        await batch.commit();
        console.log(
          `User ${userId} updated likedCategories; incremented ${addedLikes.length} likes and decremented ${removedLikes.length} unlikes.`
        );
      }
    } catch (error) {
      console.error("Error in onUserUpdate trigger:", error);
    }
  }
);
