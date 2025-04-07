const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// SSR endpoint: Render a category page using data from Firestore
app.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const categorySnap = await db.doc(`categories/${categoryId}`).get();
    if (!categorySnap.exists) {
      return res.status(404).send("Category not found");
    }
    const category = categorySnap.data();
    res.send(renderCategoryPage(category));
  } catch (error) {
    console.error("Error rendering category:", error);
    res.status(500).send("Internal server error");
  }
});

function renderCategoryPage(category) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${category.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; }
        </style>
      </head>
      <body>
        <header>
          <h1>${category.name}</h1>
          <p>${category.description || "No description available."}</p>
        </header>
        <section>
          <p>Additional dynamic content can be rendered here.</p>
        </section>
      </body>
    </html>`;
}

module.exports = { app };
