const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Import HTTP endpoints
const { app: ssrApp } = require("./src/http/ssr");
const rerankHandler = require("./src/http/rerank");

// Import Firestore triggers
const onUserUpdate = require("./src/triggers/onUserUpdate");
const onCategoryUpdate = require("./src/triggers/onCategoryUpdate");
const onNewItem = require("./src/triggers/onNewItem");

// Expose the HTTP endpoints as callable Cloud Functions
exports.ssrApp = functions.https.onRequest(ssrApp);
exports.rerankCategory = functions.https.onRequest(rerankHandler);

// Expose the background triggers
exports.onUserUpdate = onUserUpdate;
exports.onCategoryUpdate = onCategoryUpdate;
exports.onNewItem = onNewItem;
