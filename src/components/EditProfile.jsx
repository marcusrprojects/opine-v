import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import { useAuth } from "../context/useAuth";
import { handleError } from "../utils/errorUtils";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for user fields
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
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
          setEmail(user.email); // Use the auth email
        }
      } catch (error) {
        handleError(error, "Error fetching profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  // Save changes to Firestore & Firebase Auth
  const handleSave = async () => {
    if (!username.trim() || !displayName.trim() || !email.trim()) {
      alert("All fields are required.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      // Update Firestore user document
      await updateDoc(userDocRef, {
        username: username.trim(),
        name: displayName.trim(),
      });

      // Update Firebase Auth email
      if (email !== user.email) {
        await updateEmail(auth.currentUser, email.trim());
      }

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
        <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
    </div>
  );
};

export default EditProfile;
