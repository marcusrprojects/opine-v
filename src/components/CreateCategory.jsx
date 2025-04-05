import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/CreateCategory.css";
import TagSelector from "./TagSelector";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import { CategoryPrivacy, UserPrivacy } from "../enums/PrivacyEnums";
import FieldManager from "./FieldManager";
import { MAX_DESCRIPTION_LENGTH } from "../constants/CategoryConstants";
import TierSettings from "./TierSettings";
import { useUserData } from "../context/useUserData";
import { generateId } from "../utils/idUtils";

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  // Initial field now uses the new schema.
  const [fields, setFields] = useState([
    { id: generateId(), name: "Name", active: true },
  ]);
  const [tags, setTags] = useState([]);
  const { user } = useAuth();
  const { userData } = useUserData();
  const navigate = useNavigate();

  const [categoryPrivacy, setCategoryPrivacy] = useState(
    CategoryPrivacy.DEFAULT
  );
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleTogglePrivacy = () => {
    setCategoryPrivacy((prev) =>
      prev === CategoryPrivacy.ONLY_ME
        ? CategoryPrivacy.DEFAULT
        : CategoryPrivacy.ONLY_ME
    );
  };

  const isConfirmDisabled =
    !categoryName.trim() ||
    fields.filter((field) => field.active).length === 0 ||
    tags.length === 0 ||
    fields.filter((field) => field.active).some((field) => !field.name.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isConfirmDisabled) {
      alert("Please complete all fields before submitting.");
      return;
    }
    try {
      const newCategory = {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        fields,
        tags,
        categoryPrivacy,
        creatorPrivacy: userData?.creatorPrivacy || UserPrivacy.PUBLIC,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        tiers,
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
        onTogglePrivacy={handleTogglePrivacy}
        privacy={categoryPrivacy}
      />
      <h2>Create a Category</h2>
      <form className="category-form">
        <div className="category-name-group">
          <label>Category Name</label>
          <TextInput
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            required
          />
        </div>
        <div className="category-description-group">
          <label>Category Description</label>
          <p className="mini-text">{categoryDescription.length}/500</p>
          <textarea
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            placeholder="Describe your category..."
            rows={4}
            className="category-description-input"
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
        </div>
        <FieldManager fields={fields} setFields={setFields} />
        <div className="tags-group">
          <label>Tags</label>
          <TagSelector tags={tags} setTags={setTags} db={db} maxTags={5} />
        </div>
        <label className="edit-label">Tier Settings</label>
        <TierSettings tiers={tiers} setTiers={setTiers} />
      </form>
    </div>
  );
};

export default CreateCategory;
