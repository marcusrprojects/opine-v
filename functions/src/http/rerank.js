const express = require("express");
const cors = require("cors");
const { recalcAllRankingsForCategoryByRating } = require("../utils/ranking");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Re-rank endpoint: Accept new tier data from the client and trigger recalculation.
app.post("/category/:categoryId/rerank", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { newTiers } = req.body;
    if (!newTiers || !Array.isArray(newTiers)) {
      return res.status(400).json({ error: "Invalid tiers data provided." });
    }
    // Recalculate rankings using our shared ranking logic.
    await recalcAllRankingsForCategoryByRating(categoryId, newTiers);
    res.json({ message: "Re-ranking successful." });
  } catch (error) {
    console.error("Error in re-rank endpoint:", error);
    res.status(500).json({ error: "Re-ranking failed: " + error.message });
  }
});

module.exports = app;
