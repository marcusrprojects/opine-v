import express from "express";
import admin from "../firebase.js";
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
 * DELETE /categories/:categoryId
 * Deletes a category document. Only the creator is allowed.
 */
app.delete("/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({ error: "Missing categoryId" });
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
        .json({ error: "Not authorized to delete this category" });
    }
    await categoryRef.delete();
    res.json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /categories/:categoryId/like
 * Secure endpoint to toggle a like on a category for the current user.
 * It updates the current user's document's likedCategories array.
 * The onUserUpdate trigger (see below) will update the category's likeCount accordingly.
 */
app.post("/categories/:categoryId/like", async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({ error: "Missing categoryId" });
    }
    const userId = req.user.uid;
    const userDocRef = admin.firestore().doc(`users/${userId}`);
    const userSnap = await userDocRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = userSnap.data();
    const currentLikes = userData.likedCategories || [];

    if (currentLikes.includes(categoryId)) {
      // The category is currently liked—remove it (unlike)
      await userDocRef.update({
        likedCategories: admin.firestore.FieldValue.arrayRemove(categoryId),
      });
      res.json({ message: "Category unliked." });
    } else {
      // Otherwise, add the category to likedCategories (like)
      await userDocRef.update({
        likedCategories: admin.firestore.FieldValue.arrayUnion(categoryId),
      });
      res.json({ message: "Category liked." });
    }
  } catch (error) {
    console.error("Error toggling category like:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
