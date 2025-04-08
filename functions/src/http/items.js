const express = require("express");
const admin = require("firebase-admin");
const { validateFirebaseIdToken } = require("../utils/authMiddleware");
const { recalcAllRankingsForCategoryByRating } = require("../utils/ranking");

const app = express();
app.use(express.json());
// Require authentication on all item routes.
app.use(validateFirebaseIdToken);

/**
 * POST /categories/:categoryId/items
 * Expects: { itemData, rankCategory }
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
    // Update category updatedAt
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
 * Updates an existing item (or a single field if desired).
 * Only the category creator is allowed.
 */
app.put("/categories/:categoryId/items/:itemId", async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    const { updatedData } = req.body;
    if (!categoryId || !itemId || !updatedData) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    // Fetch category to check if caller is creator.
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
    // Optionally update category timestamp.
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
 * Expects: none.
 * Deletes an item. Only the category creator may delete an item.
 */
app.delete("/categories/:categoryId/items/:itemId", async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    if (!categoryId || !itemId) {
      return res.status(400).json({ error: "Missing categoryId or itemId" });
    }
    // Verify that the caller is authorized (via category document).
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
 * Recalculates rankings for items in a category. Only the category creator may perform this action.
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
    // Fetch category to ensure caller is authorized.
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    const categorySnap = await categoryRef.get();
    if (!categorySnap.exists)
      return res.status(404).json({ error: "Category not found" });
    const categoryData = categorySnap.data();
    if (req.user.uid !== categoryData.createdBy) {
      return res.status(403).json({ error: "Not authorized to rerank items" });
    }
    // Call our shared ranking logic.
    await recalcAllRankingsForCategoryByRating(categoryId, newTiers);
    res.json({ message: "Re-ranking successful." });
  } catch (error) {
    console.error("Error in re-rank endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
