/**
 * index.js
 *
 * Entry point for Cloud Functions. Exports HTTPS endpoints (our secure API)
 * and Firestore triggers.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Import HTTP endpoints
const { app: ssrApp } = require("./src/http/ssr");
const rerankHandler = require("./src/http/rerank");
const updateCategoryApp = require("./src/http/updateCategory");
const updateItemFieldApp = require("./src/http/updateItemField");
const deleteItemApp = require("./src/http/deleteItem");
const toggleLikeCategoryApp = require("./src/http/toggleLikeCategory");
const createItemApp = require("./src/http/createItem");
const getCategoryFieldsApp = require("./src/http/getCategoryFields");
const approveFollowApp = require("./src/http/approveFollow");
const rejectFollowApp = require("./src/http/rejectFollow");

// Import Firestore triggers
const onUserUpdate = require("./src/triggers/onUserUpdate");
const onCategoryUpdate = require("./src/triggers/onCategoryUpdate");
const onNewItem = require("./src/triggers/onNewItem");

// Expose HTTPS endpoints.
exports.ssrApp = functions.https.onRequest(ssrApp);
exports.rerankCategory = functions.https.onRequest(rerankHandler);
exports.updateCategory = functions.https.onRequest(updateCategoryApp);
exports.updateItemField = functions.https.onRequest(updateItemFieldApp);
exports.deleteItem = functions.https.onRequest(deleteItemApp);
exports.toggleLikeCategory = functions.https.onRequest(toggleLikeCategoryApp);
exports.createItem = functions.https.onRequest(createItemApp);
exports.getCategoryFields = functions.https.onRequest(getCategoryFieldsApp);
exports.approveFollow = functions.https.onRequest(approveFollowApp);
exports.rejectFollow = functions.https.onRequest(rejectFollowApp);

// Expose Firestore triggers.
exports.onUserUpdate = onUserUpdate;
exports.onCategoryUpdate = onCategoryUpdate;
exports.onNewItem = onNewItem;
