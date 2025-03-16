/**
 * Import necessary Firebase modules
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

/**
 * Initialize Firebase Admin SDK
 * - Required to interact with Firestore from Cloud Functions
 */
admin.initializeApp();

/**
 * Cloud Function: Automatically updates `updatedAt` when a category is modified.
 * - Listens for **any updates** to documents in the `categories` collection.
 * - If `updatedAt` was **already manually updated**, it does nothing (prevents infinite loops).
 * - Otherwise, it updates `updatedAt` with Firestore's server timestamp.
 */
exports.updateCategoryTimestamp = functions.firestore
  .document("categories/{categoryId}")
  .onUpdate(async (change) => {
    const categoryRef = change.after.ref; // Reference to the updated document

    // Prevent unnecessary updates (infinite loop protection)
    if (change.before.data().updatedAt !== change.after.data().updatedAt) {
      return null;
    }

    return categoryRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

/**
 * Example HTTP Function (Can Be Used Later)
 * - This is the default function Firebase provides.
 * - Uncomment and modify if you need an HTTP endpoint.
 */
// exports.helloWorld = functions.https.onRequest((req, res) => {
//   functions.logger.info("Hello logs!", { structuredData: true });
//   res.send("Hello from Firebase!");
// });
