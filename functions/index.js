/**
 * index.js
 *
 * Entry point for Cloud Functions. Exports our HTTPS endpoints (the secure REST API)
 * and Firestore triggers.
 */
import * as functions from "firebase-functions";

// Import RESTful endpoints (grouped by resource)
import { app as ssrApp } from "./src/http/ssr.js";
import categoriesApp from "./src/http/categories.js";
import itemsApp from "./src/http/items.js";
import followsApp from "./src/http/follows.js";

// Import Firestore triggers
import { onUserUpdate } from "./src/triggers/onUserUpdate.js";
import { onCategoryUpdate } from "./src/triggers/onCategoryUpdate.js";
import { onNewItem } from "./src/triggers/onNewItem.js";

// Expose HTTPS endpoints.
export const ssrAppFunction = functions.https.onRequest(ssrApp);
export const categories = functions.https.onRequest(categoriesApp);
export const items = functions.https.onRequest(itemsApp);
export const follows = functions.https.onRequest(followsApp);

// Expose Firestore triggers.
export { onUserUpdate, onCategoryUpdate, onNewItem };
