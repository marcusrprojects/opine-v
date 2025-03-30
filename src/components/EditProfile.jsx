import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import { useAuth } from "../context/useAuth";
import { useUserData } from "../context/useUserData";
import { handleError } from "../utils/errorUtils";
import { validateUserProfile } from "../utils/validationUtils";
import "../styles/EditProfile.css";
import PrivacySelector from "./PrivacySelector";
import { UserPrivacy } from "../enums/PrivacyEnums";
import { updateUserCategoriesPrivacy } from "../utils/privacyUtils";

const EditProfile = () => {
  const { user } = useAuth();
  const { userData } = useUserData();
  const navigate = useNavigate();

  // Local state for profile fields
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [creatorPrivacy, setCreatorPrivacy] = useState(UserPrivacy.PUBLIC);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Initialize local state from userData (if available) and auth info
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // When userData becomes available, initialize the form fields.
    if (userData) {
      setUsername(userData.username || "");
      setDisplayName(userData.name || "");
      setCreatorPrivacy(userData.creatorPrivacy || UserPrivacy.PUBLIC);
    }
    setEmail(user.email);
    setLoading(false);
  }, [user, userData, navigate]);

  // Save changes to Firestore & Firebase Auth and update categories privacy.
  const handleSave = async () => {
    const validationError = await validateUserProfile(
      username,
      displayName,
      email,
      userData?.username
    );
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      // Update extended profile data in Firestore.
      await updateDoc(userDocRef, {
        username: username.trim(),
        name: displayName.trim(),
        creatorPrivacy: creatorPrivacy,
      });

      // Update Firebase Auth email if changed (for email/password accounts)
      if (email !== user.email) {
        await updateEmail(auth.currentUser, email.trim());
      }

      await updateUserCategoriesPrivacy(user.uid, creatorPrivacy);
      // After successful update, navigate back to the user's profile.
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
