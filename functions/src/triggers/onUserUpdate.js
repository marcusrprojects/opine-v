import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import admin from "firebase-admin";

const db = admin.firestore();

const onUserUpdate = onDocumentUpdated("users/{userId}", async (event) => {
  try {
    const before = event.data.before.data();
    const after = event.data.after.data();
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
  return null;
});

export default onUserUpdate;
