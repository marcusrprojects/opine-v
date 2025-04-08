const express = require("express");
const admin = require("firebase-admin");
const app = express();

app.use(express.json());

/**
 * POST /rejectFollow
 * Expects: { uid, requesterId }
 * Rejects a follow request by removing it from the user's followRequests array.
 */
app.post("/rejectFollow", async (req, res) => {
  try {
    const { uid, requesterId } = req.body;
    if (!uid || !requesterId) {
      return res.status(400).json({ error: "Missing uid or requesterId" });
    }
    const userRef = admin.firestore().doc(`users/${uid}`);
    await userRef.update({
      followRequests: admin.firestore.FieldValue.arrayRemove(requesterId),
    });
    res.json({ message: "Follow rejected successfully." });
  } catch (error) {
    console.error("Error rejecting follow:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
