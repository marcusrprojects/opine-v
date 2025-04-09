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
    } catch (error) {
      console.error("Error in onUserUpdate trigger:", error);
    }
  }
);
