const express = require("express");
const admin = require("firebase-admin");
const app = express();

app.use(express.json());

/**
 * POST /createItem
 * Expects: { categoryId, itemData, rankCategory, updatedRankedItems (optional) }
 * Creates a new item document in the specified category.
 */
app.post("/createItem", async (req, res) => {
  try {
    const { categoryId, itemData, rankCategory, updatedRankedItems } = req.body;
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
    // Optionally update rankings if updatedRankedItems is provided.
    // (You may reuse your recalc logic here if needed.)
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

module.exports = app;
