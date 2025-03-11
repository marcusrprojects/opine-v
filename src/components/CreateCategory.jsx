import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/CreateCategory.css";
import TagSelector from "./TagSelector";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import { PRIVACY_LEVELS, PRIVACY_LABELS } from "../constants/privacy";
import FieldManager from "./FieldManager";

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [fields, setFields] = useState([{ name: "Name" }]);
  const [tags, setTags] = useState([]); // Stores tag IDs
  const { user } = useAuth();
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState(PRIVACY_LEVELS.PUBLIC);

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
        privacy,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
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
          <h3>Category Name</h3>
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
          <h3>Tags</h3>
          <TagSelector tags={tags} setTags={setTags} db={db} maxTags={5} />
        </div>

        <div className="privacy-section">
          <h3 className="edit-label">Privacy</h3>
          <select
            className="text-input"
            value={privacy}
            onChange={(e) => setPrivacy(Number(e.target.value))}
          >
            {Object.values(PRIVACY_LEVELS).map((level) => (
              <option key={level} value={level}>
                {PRIVACY_LABELS[level]}
              </option>
            ))}
          </select>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
