import { useState } from "react";
// import { db } from "../firebaseConfig";
// import {
//   collection,
//   doc,
//   getDoc,
//   getDocs,
//   query,
//   where,
// } from "firebase/firestore";
import { useAuth } from "../context/useAuth";
// import CategoryCollection from "./CategoryCollection";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import { FaEdit } from "react-icons/fa";

const Profile = () => {
  const { user } = useAuth();
  // const [likedCategories, setLikedCategories] = useState([]);
  // const [ownCategories, setOwnCategories] = useState([]);
  // const [tagMap, setTagMap] = useState({});
  const [coverPhoto, setCoverPhoto] = useState(null); // Current cover photo
  const [tempCoverPhoto, setTempCoverPhoto] = useState(null); // Temporary photo during editing
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Confirmed position
  const [tempPosition, setTempPosition] = useState({ x: 0, y: 0 }); // Temporary position during editing
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchUserCategories = async () => {
  //     if (!user) return;

  //     // Fetch user's document to get likedCategories
  //     const userDocRef = doc(db, "users", user.uid);
  //     const userDocSnapshot = await getDoc(userDocRef);

  //     if (userDocSnapshot.exists()) {
  //       const userData = userDocSnapshot.data();
  //       const likedCategoryIds = userData.likedCategories || [];

  //       // Fetch liked categories by their IDs
  //       const likedCategoryDocs = await Promise.all(
  //         likedCategoryIds.map(async (categoryId) => {
  //           const categoryDocRef = doc(db, "categories", categoryId);
  //           const categoryDocSnapshot = await getDoc(categoryDocRef);
  //           return { id: categoryId, ...categoryDocSnapshot.data() };
  //         })
  //       );

  //       setLikedCategories(likedCategoryDocs);
  //     }

  //     // Fetch categories created by the user
  //     const createdQuery = query(
  //       collection(db, "categories"),
  //       where("createdBy", "==", user.uid)
  //     );
  //     const createdSnapshot = await getDocs(createdQuery);
  //     setOwnCategories(
  //       createdSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  //     );
  //   };

  //   const fetchTags = async () => {
  //     const tagSnapshot = await getDocs(collection(db, "tags"));
  //     const tagList = tagSnapshot.docs.reduce((acc, doc) => {
  //       acc[doc.id] = doc.data().name;
  //       return acc;
  //     }, {});
  //     setTagMap(tagList);
  //   };

  //   fetchTags();
  //   fetchUserCategories();
  // }, [user]);

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempCoverPhoto(reader.result); // Set temporary cover photo during editing
        setIsEditing(true); // Enable editing mode
      };
      reader.readAsDataURL(file);

      // Reset the file input so it can be triggered again
      e.target.value = null;
    }
  };

  const handleMouseDown = () => {
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (e) => {
    if (dragging && isEditing) {
      setTempPosition((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    }
  };

  const confirmPosition = () => {
    setCoverPhoto(tempCoverPhoto); // Save the new cover photo
    setPosition(tempPosition); // Save the new position
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setTempCoverPhoto(coverPhoto); // Revert to the previous cover photo
    setTempPosition(position); // Revert to the previous position
    setIsEditing(false);

    // Reset the file input so it can be triggered again
    const fileInput = document.getElementById("cover-photo-input");
    if (fileInput) fileInput.value = null;
  };

  if (!user) {
    return (
      <div className="login-prompt">
        <h2>Profile</h2>
        <p>
          Please log in or sign up to view your categories and liked categories.
        </p>
        <div className="auth-buttons">
          <button className="login-button" onClick={() => navigate("/login")}>
            Log In
          </button>
          <button className="signup-button" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div
        className="cover-photo"
        style={{
          backgroundImage: tempCoverPhoto ? `url(${tempCoverPhoto})` : "none",
          backgroundPosition: `${tempPosition.x}px ${tempPosition.y}px`,
        }}
        onMouseDown={isEditing ? handleMouseDown : null}
        onMouseMove={isEditing ? handleMouseMove : null}
        onMouseUp={isEditing ? handleMouseUp : null}
        onMouseLeave={isEditing ? handleMouseUp : null}
      >
        <div className="text-box">
          <h2>{user.name || "Anonymous"}</h2>
          <h3>@{user.username || "unknown"}</h3>
        </div>
        <button
          className="edit-cover-photo-button"
          onClick={() => document.getElementById("cover-photo-input").click()}
        >
          <FaEdit />
        </button>
        <input
          type="file"
          accept="image/*"
          id="cover-photo-input"
          style={{ display: "none" }}
          onChange={handleCoverPhotoChange}
        />
      </div>
      {isEditing && (
        <div className="edit-controls">
          <button onClick={confirmPosition} className="confirm-button">
            Confirm
          </button>
          <button onClick={cancelEdit} className="cancel-button">
            Cancel
          </button>
        </div>
      )}
      <div>
        <h3>Your Categories</h3>
        {/* <CategoryCollection categories={ownCategories} tagMap={tagMap} /> */}
      </div>
      <div>
        <h3>Liked Categories</h3>
        {/* <CategoryCollection categories={likedCategories} tagMap={tagMap} /> */}
      </div>
    </div>
  );
};

export default Profile;
