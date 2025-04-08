const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      const userId = context.params.userId;
      const beforeFollowers = before.followers || [];
      const afterFollowers = after.followers || [];

      if (afterFollowers.length > beforeFollowers.length) {
        const newFollowers = afterFollowers.filter(
          (f) => !beforeFollowers.includes(f)
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
