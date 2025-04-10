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

/**
 * POST /follows/followData
 * Expects: { uid, mode }.
 * Returns follow data based on mode (followers, following, or followRequests).
 */
app.post("/follows/followData", async (req, res) => {
  try {
    const { uid, mode } = req.body;
    if (!uid || !mode) {
      return res.status(400).json({ error: "Missing uid or mode" });
    }
    const userRef = admin.firestore().doc(`users/${uid}`);
    const userSnap = await userRef.get();
    if (!userSnap.exists)
      return res.status(404).json({ error: "User not found" });
    const userData = userSnap.data();
    let userIds = [];
    switch (mode) {
      case "FOLLOWERS":
        userIds = userData.followers || [];
        break;
      case "FOLLOWING":
        userIds = userData.following || [];
        break;
      case "FOLLOW_REQUESTS":
        userIds = userData.followRequests || [];
        break;
      default:
        return res.status(400).json({ error: "Invalid mode" });
    }
    const usersData = await Promise.all(
      userIds.map(async (userId) => {
        const snap = await admin.firestore().doc(`users/${userId}`).get();
        return snap.exists ? { id: userId, ...snap.data() } : null;
      })
    );
    const users = usersData.filter((u) => u !== null);
    res.json({ users });
  } catch (error) {
    console.error("Error fetching follow data:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
