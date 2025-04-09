import { onDocumentCreated } from "firebase-functions/v2/firestore";
import admin from "../firebase.js";

const db = admin.firestore();

export const onNewItem = onDocumentCreated(
  "categories/{categoryId}/items/{itemId}",
  async (event) => {
    try {
      const { categoryId, itemId } = event.params;
      const categorySnap = await db.doc(`categories/${categoryId}`).get();
      if (!categorySnap.exists) return;
      const categoryData = categorySnap.data();
      const ownerId = categoryData.createdBy;
      const feedItem = {
        type: "new_item",
        categoryId,
        itemId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };
      const ownerSnap = await db.doc(`users/${ownerId}`).get();
      if (!ownerSnap.exists) return;
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
      // Add to the public feed if the owner’s profile is public.
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
  }
);
