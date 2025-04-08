const express = require("express");
const admin = require("firebase-admin");
const app = express();

app.use(express.json());

/**
 * POST /approveFollow
 * Expects: { uid, requesterId }
 * Approves a follow request by updating both the recipient's and requester's documents.
 */
app.post("/approveFollow", async (req, res) => {
  try {
    const { uid, requesterId } = req.body;
    if (!uid || !requesterId) {
      return res.status(400).json({ error: "Missing uid or requesterId" });
    }
    const userRef = admin.firestore().doc(`users/${uid}`);
    await userRef.update({
      followRequests: admin.firestore.FieldValue.arrayRemove(requesterId),
      followers: admin.firestore.FieldValue.arrayUnion(requesterId),
    });
    const requesterRef = admin.firestore().doc(`users/${requesterId}`);
    await requesterRef.update({
      following: admin.firestore.FieldValue.arrayUnion(uid),
    });
    res.json({ message: "Follow approved successfully." });
  } catch (error) {
    console.error("Error approving follow:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
