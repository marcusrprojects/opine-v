const express = require("express");
const admin = require("firebase-admin");
const app = express();

app.use(express.json());

/**
 * POST /updateCategory
 * Expects: { categoryId, updatedCategory }
 * Updates the category document using a server timestamp.
 */
app.post("/updateCategory", async (req, res) => {
  try {
    const { categoryId, updatedCategory } = req.body;
    if (!categoryId || !updatedCategory) {
      return res
        .status(400)
        .json({ error: "Missing categoryId or updatedCategory" });
    }
    updatedCategory.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await admin
      .firestore()
      .doc(`categories/${categoryId}`)
      .update(updatedCategory);
    res.json({ message: "Category updated successfully." });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
