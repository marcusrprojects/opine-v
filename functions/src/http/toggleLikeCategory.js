const express = require("express");
const admin = require("firebase-admin");
const app = express();

app.use(express.json());

/**
 * POST /toggleLikeCategory
 * Expects: { categoryId }
 * Toggles a like on the category by incrementing or decrementing the likeCount.
 * (In a full implementation you would determine whether to add or remove a like based on the user's current state.)
 */
app.post("/toggleLikeCategory", async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) {
      return res.status(400).json({ error: "Missing categoryId" });
    }
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    await admin.firestore().runTransaction(async (transaction) => {
      const docSnapshot = await transaction.get(categoryRef);
      if (!docSnapshot.exists) {
        throw new Error("Category not found.");
      }
      const data = docSnapshot.data();
      const currentLikes = data.likeCount || 0;
      // Toggle logic (for simplicity, incrementing here)
      const newLikes = currentLikes + 1;
      transaction.update(categoryRef, {
        likeCount: newLikes,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    res.json({ message: "Like toggled successfully." });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
