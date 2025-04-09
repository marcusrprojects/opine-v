import functions from "firebase-functions";
import admin from "firebase-admin";

const db = admin.firestore();

export const onNewItem = functions.firestore
  .document("categories/{categoryId}/items/{itemId}")
  .onCreate(async (snap, context) => {
    try {
      const { categoryId, itemId } = context.params;
      const categorySnap = await db.doc(`categories/${categoryId}`).get();
      if (!categorySnap.exists) return null;
      const categoryData = categorySnap.data();
      const ownerId = categoryData.createdBy;

      const feedItem = {
        type: "new_item",
        categoryId,
        itemId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      const ownerSnap = await db.doc(`users/${ownerId}`).get();
      if (!ownerSnap.exists) return null;
      const ownerData = ownerSnap.data();
      const followers = ownerData.followers || [];

      const batch = db.batch();
      followers.forEach((followerId) => {
        const feedRef = db
          .collection("feeds")
          .doc(followerId)
          .collection("items")
          .doc();
        batch.set(feedRef, feedItem);
      });

      if (ownerData.creatorPrivacy === "public") {
        const publicFeedRef = db
          .collection("feeds")
          .doc("public")
          .collection("items")
          .doc();
        batch.set(publicFeedRef, feedItem);
      }

      await batch.commit();
    } catch (error) {
      console.error("Error in onNewItem trigger:", error);
    }
    return null;
  });
