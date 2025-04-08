/**
 * index.js
 *
 * Entry point for Cloud Functions. Exports our HTTPS endpoints (the secure REST API)
 * and Firestore triggers.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Import RESTful endpoints (grouped by resource)
const ssrApp = require("./src/http/ssr").app;
const categoriesApp = require("./src/http/categories");
const itemsApp = require("./src/http/items");
const followsApp = require("./src/http/follows");

// Import Firestore triggers
const onUserUpdate = require("./src/triggers/onUserUpdate");
const onCategoryUpdate = require("./src/triggers/onCategoryUpdate");
const onNewItem = require("./src/triggers/onNewItem");

// Expose HTTPS endpoints.
// These endpoints will be accessible based on your Hosting rewrites.
exports.ssrApp = functions.https.onRequest(ssrApp);
exports.categories = functions.https.onRequest(categoriesApp);
exports.items = functions.https.onRequest(itemsApp);
exports.follows = functions.https.onRequest(followsApp);

// Expose Firestore triggers.
exports.onUserUpdate = onUserUpdate;
exports.onCategoryUpdate = onCategoryUpdate;
exports.onNewItem = onNewItem;
