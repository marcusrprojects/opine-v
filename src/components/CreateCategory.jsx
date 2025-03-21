import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/CreateCategory.css";
import TagSelector from "./TagSelector";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import { USER_PRIVACY } from "../constants/privacy";
import FieldManager from "./FieldManager";
import PrivacySelector from "./PrivacySelector";

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [fields, setFields] = useState([{ name: "Name" }]);
  const [tags, setTags] = useState([]); // Stores tag IDs
  const { user } = useAuth();
  const navigate = useNavigate();

  // Using categoryPrivacy for the category-level privacy
  const [privacy, setPrivacy] = useState(USER_PRIVACY.PUBLIC);

  const isConfirmDisabled =
    !categoryName.trim() ||
    fields.length === 0 ||
    tags.length === 0 ||
    fields.some((field) => !field.name.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isConfirmDisabled) {
      alert("Please complete all fields before submitting.");
      return;
    }

    try {
      const newCategory = {
        name: categoryName.trim(),
        fields: fields.map((field) => field.name),
        tags,
        categoryPrivacy: privacy,
        creatorPrivacy: user.creatorPrivacy,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "categories"), newCategory);
      navigate("/categories");
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="create-category-container">
      <ActionPanel
        onCancel={() => navigate("/categories")}
        onConfirm={handleSubmit}
        isConfirmDisabled={isConfirmDisabled}
      />

      <h2>Create a Category</h2>

      <form className="category-form">
        {/* Category Name Section */}
        <div className="category-name-group">
          <label>Category Name</label>
          <TextInput
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            required
          />
        </div>

        {/* Attributes Section */}
        <FieldManager fields={fields} setFields={setFields} />

        {/* Tags Section */}
        <div className="tags-group">
          <label>Tags</label>
          <TagSelector tags={tags} setTags={setTags} db={db} maxTags={5} />
        </div>

        {/* Privacy Selector */}
        <PrivacySelector
          privacy={privacy}
          setPrivacy={setPrivacy}
          type="category"
        />
      </form>
    </div>
  );
};

export default CreateCategory;
