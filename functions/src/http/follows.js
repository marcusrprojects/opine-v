import express from "express";
import admin from "../firebase.js";
import { validateFirebaseIdToken } from "../utils/authMiddleware.js";

const app = express();
app.use(express.json());
app.use(validateFirebaseIdToken);

/**
 * POST /follows/approve
 * Expects: { uid, requesterId }.
 * Approves a follow request.
 */
app.post("/follows/approve", async (req, res) => {
  try {
    const { uid, requesterId } = req.body;
    if (!uid || !requesterId) {
      return res.status(400).json({ error: "Missing uid or requesterId" });
    }
    if (req.user.uid !== uid) {
      return res
        .status(403)
        .json({ error: "Not authorized to approve follows for this account." });
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

/**
 * POST /follows/reject
 * Expects: { uid, requesterId }.
 * Rejects a follow request.
 */
app.post("/follows/reject", async (req, res) => {
  try {
    const { uid, requesterId } = req.body;
    if (!uid || !requesterId) {
      return res.status(400).json({ error: "Missing uid or requesterId" });
    }
    if (req.user.uid !== uid) {
      return res
        .status(403)
        .json({ error: "Not authorized to reject follows for this account." });
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

export default app;
