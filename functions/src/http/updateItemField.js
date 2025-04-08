const express = require("express");
const admin = require("firebase-admin");
const app = express();

app.use(express.json());

/**
 * POST /updateItemField
 * Expects: { categoryId, itemId, field, updatedValue }
 * Updates a single field of an item and updates the category's updatedAt timestamp.
 */
app.post("/updateItemField", async (req, res) => {
  try {
    const { categoryId, itemId, field, updatedValue } = req.body;
    if (!categoryId || !itemId || !field) {
      return res.status(400).json({ error: "Missing parameters" });
    }
    const itemRef = admin
      .firestore()
      .doc(`categories/${categoryId}/items/${itemId}`);
    await itemRef.update({ [field]: updatedValue });
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    await categoryRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Item field updated successfully." });
  } catch (error) {
    console.error("Error updating item field:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
