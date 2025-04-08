const express = require("express");
const admin = require("firebase-admin");
const { validateFirebaseIdToken } = require("../utils/authMiddleware");

const app = express();
app.use(express.json());

// Protect all routes on this resource.
app.use(validateFirebaseIdToken);

/**
 * GET /categories/:categoryId/fields
 * Returns fields and tiers for the category.
 */
app.get("/categories/:categoryId/fields", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const categorySnap = await admin
      .firestore()
      .doc(`categories/${categoryId}`)
      .get();
    if (!categorySnap.exists) {
      return res.status(404).json({ error: "Category not found" });
    }
    const data = categorySnap.data();
    // We assume the fields follow the new schema (with id, name, active).
    res.json({ fields: data.fields || [], tiers: data.tiers || [] });
  } catch (error) {
    console.error("Error fetching category fields:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /categories/:categoryId
 * Expects JSON body { updatedCategory }.
 * Updates a category document. Only the creator is allowed.
 */
app.put("/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { updatedCategory } = req.body;
    if (!categoryId || !updatedCategory) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Fetch category to check permissions.
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    const categorySnap = await categoryRef.get();
    if (!categorySnap.exists) {
      return res.status(404).json({ error: "Category not found" });
    }
    const categoryData = categorySnap.data();
    // Ensure the caller is the creator.
    if (req.user.uid !== categoryData.createdBy) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this category" });
    }

    updatedCategory.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await categoryRef.update(updatedCategory);
    res.json({ message: "Category updated successfully." });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /categories/:categoryId/like
 * Expects no body. Toggles the like status.
 * (In a full implementation, you’d check whether the caller has already liked, etc.)
 */
app.put("/categories/:categoryId/like", async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({ error: "Missing categoryId" });
    }

    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    await admin.firestore().runTransaction(async (transaction) => {
      const docSnapshot = await transaction.get(categoryRef);
      if (!docSnapshot.exists) throw new Error("Category not found");
      const data = docSnapshot.data();
      // Here you must add your logic to determine if the user already liked this category.
      // For simplicity, we assume the action is allowed and we increment likeCount.
      const currentLikes = data.likeCount || 0;
      // (You could later use the caller’s UID to toggle state.)
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
