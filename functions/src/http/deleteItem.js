const express = require("express");
const admin = require("firebase-admin");
const app = express();

app.use(express.json());

/**
 * POST /deleteItem
 * Expects: { categoryId, itemId }
 * Deletes an item and updates the category's updatedAt timestamp.
 */
app.post("/deleteItem", async (req, res) => {
  try {
    const { categoryId, itemId } = req.body;
    if (!categoryId || !itemId) {
      return res.status(400).json({ error: "Missing categoryId or itemId" });
    }
    const itemRef = admin
      .firestore()
      .doc(`categories/${categoryId}/items/${itemId}`);
    await itemRef.delete();
    const categoryRef = admin.firestore().doc(`categories/${categoryId}`);
    await categoryRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
