import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import "../styles/EditCategory.css";
import { handleError } from "../utils/errorUtils";
import TagSelector from "./TagSelector";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import { PRIVACY_LEVELS } from "../constants/privacy";
import FieldManager from "./FieldManager";
import PrivacySelector from "./PrivacySelector";

const EditCategory = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Local state
  const [categoryName, setCategoryName] = useState(
    location.state?.categoryName || ""
  );
  const [description, setDescription] = useState(
    location.state?.description || ""
  );
  const [fields, setFields] = useState(
    location.state?.fields?.map((name) => ({ name })) || []
  );
  const [tags, setTags] = useState(location.state?.tags || []);
  const [privacy, setPrivacy] = useState(
    location.state?.privacy ?? PRIVACY_LEVELS.PUBLIC
  );
  const [loading, setLoading] = useState(!location.state);

  // Fetch category data if not provided via location.state
  useEffect(() => {
    if (!location.state) {
      const fetchCategoryData = async () => {
        try {
          const categoryDocRef = doc(db, "categories", categoryId);
          const categorySnapshot = await getDoc(categoryDocRef);

          if (categorySnapshot.exists()) {
            const data = categorySnapshot.data();
            setCategoryName(data.name || "");
            setDescription(data.description || "");
            setFields(data.fields?.map((name) => ({ name })) || []);
            setTags(data.tags || []);
            setPrivacy(data.privacy ?? PRIVACY_LEVELS.PUBLIC);
          }
        } catch (error) {
          handleError(error, "Error fetching category data");
        } finally {
          setLoading(false);
        }
      };

      fetchCategoryData();
    }
  }, [categoryId, location.state]);

  // Save changes to Firestore
  const handleSave = async () => {
    if (!categoryName.trim()) {
      alert("Category name is required.");
      return;
    }
    if (fields.length === 0) {
      alert("At least one field is required.");
      return;
    }

    try {
      const categoryDocRef = doc(db, "categories", categoryId);
      await updateDoc(categoryDocRef, {
        name: categoryName.trim(),
        description,
        fields: fields.map((field) => field.name), // Convert back to string array
        tags,
        privacy,
        updatedAt: Timestamp.now(),
      });

      navigate(`/categories/${categoryId}`);
    } catch (error) {
      handleError(error, "Error saving category.");
    }
  };

  const isConfirmDisabled =
    !categoryName.trim() ||
    fields.length === 0 ||
    tags.length === 0 ||
    fields.some((field) => !field.name.trim());

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="edit-category-container">
      <ActionPanel
        onCancel={() => navigate(`/categories/${categoryId}`)}
        onConfirm={handleSave}
        isConfirmDisabled={isConfirmDisabled}
      />

      <h2 className="edit-category-title">{categoryName || "Edit Category"}</h2>

      {/* Edit Title & Description */}
      <div className="edit-section">
        <label className="edit-label">Title</label>
        <TextInput
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category Name"
        />

        <label className="edit-label">Description</label>
        <textarea
          className="edit-description"
          placeholder="Any words of advice for understanding how to read this board?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Fields Management Using FieldManager */}
      <FieldManager fields={fields} setFields={setFields} />

      {/* Tag Selector */}
      <div className="tags-group">
        <label className="edit-label">Tags</label>
        <TagSelector tags={tags} setTags={setTags} db={db} maxTags={5} />
      </div>

      <PrivacySelector privacy={privacy} setPrivacy={setPrivacy} />
    </div>
  );
};

EditCategory.propTypes = {
  categoryName: PropTypes.string,
  description: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.string),
  tags: PropTypes.arrayOf(PropTypes.string),
};

export default EditCategory;
