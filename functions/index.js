const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json()); // Parse JSON bodies

// SSR endpoint: Render a category page for server-side rendering
app.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const categorySnap = await db.doc(`categories/${categoryId}`).get();
    if (!categorySnap.exists) {
      return res.status(404).send("Category not found");
    }
    const category = categorySnap.data();
    res.send(renderCategoryPage(category));
  } catch (error) {
    console.error("Error rendering category:", error);
    res.status(500).send("Internal server error");
  }
});

function renderCategoryPage(category) {
  return `
    <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${category.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; }
        </style>
      </head>
      <body>
        <header>
          <h1>${category.name}</h1>
          <p>${category.description || "No description available."}</p>
        </header>
        <section>
          <p>Additional dynamic content can be rendered here.</p>
        </section>
      </body>
      </html>`;
}

// API endpoint for re-ranking items (stub implementation)
app.post("/category/:categoryId/rerank", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { items, tier } = req.body;
    // TODO: validate input and call your ranking recalculation function,
    // such as recalcAllRankingsForCategoryByRating.
    // For now, we return a stub response.
    res.json({ message: "Re-ranking triggered (stub implementation)" });
  } catch (error) {
    console.error("Error in re-rank endpoint:", error);
    res.status(500).json({ error: "Rerank failed" });
  }
});

// Firestore trigger: Send notification on new follower
exports.onUserUpdate = functions.firestore
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
      console.error("Error in onUserUpdate:", error);
    }
    return null;
  });

// Firestore trigger: Handle like updates on a category (send or remove notification)
exports.onCategoryUpdate = functions.firestore
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
        // Remove the like notification if a like is rescinded.
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
      console.error("Error in onCategoryUpdate:", error);
    }
    return null;
  });

// Firestore trigger: Update feeds when a new item is created
exports.onNewItem = functions.firestore
  .document("categories/{categoryId}/items/{itemId}")
  .onCreate(async (snap, context) => {
    try {
      const itemData = snap.data();
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
      // Optionally add to a public feed if the owner's profile is public.
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
      console.error("Error in onNewItem:", error);
    }
    return null;
  });

// Export the Express app as an HTTPS Cloud Function
exports.ssrApp = functions.https.onRequest(app);
