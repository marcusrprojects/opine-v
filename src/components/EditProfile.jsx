import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import { useAuth } from "../context/useAuth";
import { handleError } from "../utils/errorUtils";
import { validateUserProfile } from "../utils/validationUtils";
import "../styles/EditProfile.css";
import PrivacySelector from "./PrivacySelector";
import { USER_PRIVACY } from "../constants/privacy";
import { updateUserCategoriesPrivacy } from "../utils/privacyUtils";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Local state for profile fields
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [creatorPrivacy, setCreatorPrivacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          setUsername(data.username || "");
          setDisplayName(data.name || "");
          setEmail(user.email);
          setCreatorPrivacy(data.creatorPrivacy || USER_PRIVACY.PUBLIC);
        }
      } catch (error) {
        handleError(error, "Error fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  // Save changes to Firestore & Firebase Auth,
  // and propagate new privacy setting to the user's categories.
  const handleSave = async () => {
    // Validate inputs
    const validationError = await validateUserProfile(
      username,
      displayName,
      email,
      user.username
    );
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      // Update user document with new username, name, and privacy setting.
      await updateDoc(userDocRef, {
        username: username.trim(),
        name: displayName.trim(),
        creatorPrivacy: creatorPrivacy,
      });

      // Update Firebase Auth email if it changed (only for email/password users)
      if (email !== user.email) {
        await updateEmail(auth.currentUser, email.trim());
      }

      await updateUserCategoriesPrivacy(user.uid, creatorPrivacy);
      // Navigate back to profile after successful update
      navigate(`/profile/${user.uid}`);
    } catch (error) {
      handleError(error, "Error saving profile.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="edit-profile-container">
      <ActionPanel
        onCancel={() => navigate(`/profile/${user.uid}`)}
        onConfirm={handleSave}
        isConfirmDisabled={
          !username.trim() || !displayName.trim() || !email.trim()
        }
      />

      <h2 className="edit-profile-title">Edit Profile</h2>

      <div className="edit-section">
        <label className="edit-label">Username</label>
        <TextInput
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="edit-label">Display Name</label>
        <TextInput
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <label className="edit-label">Email</label>
        {user.authMethod === "google" ? (
          <p className="email-text">{email}</p>
        ) : (
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
        )}

        <label className="edit-label">Account Privacy</label>
        <PrivacySelector
          privacy={creatorPrivacy}
          setPrivacy={setCreatorPrivacy}
          type={"user"}
        />
      </div>
    </div>
  );
};

export default EditProfile;
