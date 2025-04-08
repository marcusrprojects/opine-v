const express = require("express");
const admin = require("firebase-admin");
const app = express();

app.use(express.json());

/**
 * POST /getCategoryFields
 * Expects: { categoryId }
 * Returns the fields and tiers from the specified category.
 */
app.post("/getCategoryFields", async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) {
      return res.status(400).json({ error: "Missing categoryId" });
    }
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

module.exports = app;
