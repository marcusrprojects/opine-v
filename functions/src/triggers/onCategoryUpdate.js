import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import admin from "../firebase.js";

const db = admin.firestore();

export const onCategoryUpdate = onDocumentUpdated(
  "categories/{categoryId}",
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
      const categoryId = event.params.categoryId;
      const previousLikeCount = before.likeCount || 0;
      const currentLikeCount = after.likeCount || 0;
      const ownerId = after.createdBy;
      if (currentLikeCount > previousLikeCount) {
        const notification = {
          type: "board_liked",
          categoryId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          message: "Your board was liked.",
        };
        await db
          .collection("notifications")
          .doc(ownerId)
          .collection("userNotifications")
          .add(notification);
      } else if (currentLikeCount < previousLikeCount) {
        // Remove like notification if a like is rescinded.
        const notificationsSnapshot = await db
          .collection("notifications")
          .doc(ownerId)
          .collection("userNotifications")
          .where("type", "==", "board_liked")
          .where("categoryId", "==", categoryId)
          .get();
        const batch = db.batch();
        notificationsSnapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error("Error in onCategoryUpdate trigger:", error);
    }
  }
);
