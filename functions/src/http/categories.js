import express from "express";
import admin from "firebase-admin";
import { validateFirebaseIdToken } from "../utils/authMiddleware.js";

const app = express();
app.use(express.json());
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
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    const categorySnap = await categoryRef.get();
    if (!categorySnap.exists) {
      return res.status(404).json({ error: "Category not found" });
    }
    const categoryData = categorySnap.data();
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
      const currentLikes = data.likeCount || 0;
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

export default app;
