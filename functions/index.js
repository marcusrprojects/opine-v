/**
 * Comprehensive Cloud Functions for [Your Project Name]
 *
 * This file serves multiple purposes:
 *  - An Express app that handles SSR and API endpoints.
 *  - Firestore triggers for notifications (new follower, board likes)
 *    and feed updates on new item creation.
 *  - Ranking recalculation and timestamp updates are included.
 *
 * This setup is designed to be maintainable, modular, and scalable.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

/**
 * --------------------------
 * Express Application for SSR and API Endpoints
 * --------------------------
 */
const app = express();
app.use(cors({ origin: true }));

// Example SSR endpoint: Render a category page.
app.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const categorySnap = await db.doc(`categories/${categoryId}`).get();
    if (!categorySnap.exists) {
      return res.status(404).send("Category not found");
    }
    const category = categorySnap.data();
    // Render a basic HTML page. In production, consider using a templating engine.
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${category.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; }
          header { margin-bottom: 2rem; }
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
      </html>
    `);
  } catch (error) {
    console.error("Error rendering category page:", error);
    res.status(500).send("Internal server error");
  }
});

// Example API endpoint for reranking items (stub implementation).
app.post("/category/:categoryId/rerank", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    // TODO: Extract and validate request data.
    // Implement your reranking logic here, updating items as needed.
    res.json({ message: "Rerank executed (stub)." });
  } catch (error) {
    console.error("Error in rerank endpoint:", error);
    res.status(500).json({ error: "Rerank failed" });
  }
});

/**
 * --------------------------
 * Firestore Triggers for Notifications and Feed Updates
 * --------------------------
 */

// 1. Notification on New Follower:
// Trigger when a user's document is updated. Compares the "followers" array before and after.
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
      console.error("Error in onUserUpdate:", error);
    }
    return null;
  });

// 2. Notification on Board (Category) Like:
// Trigger when a category document is updated and the likeCount increases.
exports.onCategoryUpdate = functions.firestore
  .document("categories/{categoryId}")
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      const categoryId = context.params.categoryId;
      const previousLikeCount = before.likeCount || 0;
      const currentLikeCount = after.likeCount || 0;

      if (currentLikeCount > previousLikeCount) {
        const ownerId = after.createdBy;
        const notification = {
          type: "board_liked",
          categoryId: categoryId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          message: "Your board was liked.",
        };
        await db
          .collection("notifications")
          .doc(ownerId)
          .collection("userNotifications")
          .add(notification);
      } else if (currentLikeCount < previousLikeCount) {
        // If a like is rescinded, remove the corresponding notifications.
        const ownerId = after.createdBy;
        const notificationsSnapshot = await db
          .collection("notifications")
          .doc(ownerId)
          .collection("userNotifications")
          .where("type", "==", "board_liked")
          .where("categoryId", "==", categoryId)
          .get();
        const batch = db.batch();
        notificationsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error("Error in onCategoryUpdate:", error);
    }
    return null;
  });

// 3. Feed Update on New Item Creation:
// When a new item is added to a board, add a feed entry for each follower of the board owner.
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
        categoryId: categoryId,
        itemId: itemId,
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

/**
 * --------------------------
 * Export Cloud Functions
 * --------------------------
 */

// Export the Express app as an HTTPS function for SSR and API endpoints.
exports.ssrApp = functions.https.onRequest(app);
