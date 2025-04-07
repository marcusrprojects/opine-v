const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

module.exports = functions.firestore
  .document("categories/{categoryId}")
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      const categoryId = context.params.categoryId;
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
        notificationsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
    } catch (error) {
      console.error("Error in onCategoryUpdate trigger:", error);
    }
    return null;
  });
