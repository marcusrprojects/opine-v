import express from "express";
import admin from "../firebase.js";
import { validateFirebaseIdToken } from "../utils/authMiddleware.js";
import { recalcAllRankingsForCategoryByRating } from "../utils/ranking.js";

const app = express();
app.use(express.json());
app.use(validateFirebaseIdToken);

/**
 * POST /categories/:categoryId/items
 * Expects: { itemData, rankCategory }.
 * Creates a new item in the specified category.
 */
app.post("/categories/:categoryId/items", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { itemData, rankCategory } = req.body;
    if (!categoryId || !itemData) {
      return res.status(400).json({ error: "Missing categoryId or itemData" });
    }
    const itemsCollectionRef = admin
      .firestore()
      .collection(`categories/${categoryId}/items`);
    const newItemRef = await itemsCollectionRef.add({
      ...itemData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      rankCategory,
    });
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    await categoryRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Item created successfully.", itemId: newItemRef.id });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /categories/:categoryId/items/:itemId
 * Expects: { updatedData }.
 * Updates an existing item.
 * Only the category creator is allowed.
 */
app.put("/categories/:categoryId/items/:itemId", async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    const { updatedData } = req.body;
    if (!categoryId || !itemId || !updatedData) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    const categorySnap = await categoryRef.get();
    if (!categorySnap.exists)
      return res.status(404).json({ error: "Category not found" });
    const categoryData = categorySnap.data();
    if (req.user.uid !== categoryData.createdBy) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this item" });
    }
    const itemRef = admin
      .firestore()
      .doc(`categories/${categoryId}/items/${itemId}`);
    await itemRef.update({
      ...updatedData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await categoryRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Item updated successfully." });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /categories/:categoryId/items/:itemId
 * Deletes an item. Only the category creator is allowed.
 */
app.delete("/categories/:categoryId/items/:itemId", async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    if (!categoryId || !itemId) {
      return res.status(400).json({ error: "Missing categoryId or itemId" });
    }
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    const categorySnap = await categoryRef.get();
    if (!categorySnap.exists)
      return res.status(404).json({ error: "Category not found" });
    const categoryData = categorySnap.data();
    if (req.user.uid !== categoryData.createdBy) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this item" });
    }
    const itemRef = admin
      .firestore()
      .doc(`categories/${categoryId}/items/${itemId}`);
    await itemRef.delete();
    await categoryRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /categories/:categoryId/rerank
 * Expects: { newTiers, updatedItems, rankCategory }.
 * Recalculates rankings for items in a category. Only the category creator is allowed.
 */
app.post("/categories/:categoryId/rerank", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { newTiers, updatedItems, rankCategory } = req.body;
    if (!categoryId || !newTiers || !updatedItems || !rankCategory) {
      return res
        .status(400)
        .json({ error: "Missing parameters for reranking" });
    }
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    const categorySnap = await categoryRef.get();
    if (!categorySnap.exists)
      return res.status(404).json({ error: "Category not found" });
    const categoryData = categorySnap.data();
    if (req.user.uid !== categoryData.createdBy) {
      return res.status(403).json({ error: "Not authorized to rerank items" });
    }
    await recalcAllRankingsForCategoryByRating(categoryId, newTiers);
    res.json({ message: "Re-ranking successful." });
  } catch (error) {
    console.error("Error in re-rank endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
