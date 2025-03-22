import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/CreateCategory.css";
import TagSelector from "./TagSelector";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import { CategoryPrivacy } from "../enums/PrivacyEnums";
import FieldManager from "./FieldManager";
import PrivacySelector from "./PrivacySelector";

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState("");
  const [fields, setFields] = useState([{ name: "Name" }]);
  const [tags, setTags] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categoryPrivacy, setCategoryPrivacy] = useState(
    CategoryPrivacy.DEFAULT
  );

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
        fields,
        tags,
        categoryPrivacy,
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
        <div className="category-name-group">
          <label>Category Name</label>
          <TextInput
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            required
          />
        </div>

        <FieldManager fields={fields} setFields={setFields} />

        <div className="tags-group">
          <label>Tags</label>
          <TagSelector tags={tags} setTags={setTags} db={db} maxTags={5} />
        </div>

        <label className="edit-label">&quot;Only Me&quot;</label>
        <PrivacySelector
          privacy={categoryPrivacy}
          setPrivacy={setCategoryPrivacy}
          type="category"
        />
      </form>
    </div>
  );
};

export default CreateCategory;
