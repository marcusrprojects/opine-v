import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaTrash, FaPlus } from "react-icons/fa";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../styles/EditCategory.css";
import { handleError } from "../utils/errorUtils";
import TagSelector from "./TagSelector";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import Button from "./Navigation/Button";
import { PRIVACY_LEVELS } from "../constants/privacy";

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
  const [fields, setFields] = useState(location.state?.fields || []);
  const [primaryField, setPrimaryField] = useState(
    location.state?.primaryField || ""
  );
  const [tags, setTags] = useState(location.state?.tags || []);
  const [privacy, setPrivacy] = useState(
    location.state?.privacy || PRIVACY_LEVELS.PUBLIC
  );
  const [newField, setNewField] = useState("");
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
            setFields(data.fields || []);
            setPrimaryField(data.primaryField || "");
            setTags(data.tags || []);
            setPrivacy(data.privacy || PRIVACY_LEVELS.PUBLIC);
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
    if (!primaryField || !fields.includes(primaryField)) {
      alert("A valid primary field must be selected.");
      return;
    }

    try {
      const categoryDocRef = doc(db, "categories", categoryId);
      await updateDoc(categoryDocRef, {
        name: categoryName.trim(),
        description,
        fields,
        primaryField,
        tags,
        privacy,
      });
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      handleError(error, "Error saving category.");
    }
  };

  // Handle adding a new field
  const handleAddField = () => {
    if (newField && !fields.includes(newField)) {
      setFields([...fields, newField]);
      setNewField("");
    }
  };

  // Handle removing a field
  const handleRemoveField = (field) => {
    if (primaryField === field) {
      alert("Select a new primary field before removing this one.");
      return;
    }
    setFields(fields.filter((f) => f !== field));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="edit-category-container">
      <ActionPanel
        onCancel={() => navigate(`/categories/${categoryId}`)}
        onConfirm={handleSave}
        isConfirmDisabled={false}
      />

      <h2 className="edit-category-title">{categoryName || "Edit Category"}</h2>

      {/* Edit Title & Description */}
      <div className="edit-section">
        <label className="edit-label">Title</label>
        <input
          type="text"
          className="edit-title"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />

        <label className="edit-label">Description</label>
        <textarea
          className="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Fields Management */}
      <div className="field-section">
        <label className="edit-label">Fields</label>
        <ul className="edit-list">
          {fields.map((field) => (
            <li key={field} className="edit-list-item">
              <input
                type="radio"
                name="primaryField"
                checked={primaryField === field}
                onChange={() => setPrimaryField(field)}
                className="field-radio"
                id={`field-radio-${field}`}
              />
              <label htmlFor={`field-radio-${field}`} className="property-pair">
                {field}
              </label>
              <FaTrash
                onClick={() => handleRemoveField(field)}
                className="icon delete-icon"
              />
            </li>
          ))}
        </ul>

        <div className="edit-add-field">
          <TextInput
            placeholder="Add new field"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
          />
          <Button onClick={handleAddField} title="Add Field" icon={FaPlus} />
        </div>
      </div>

      {/* Tag Selector */}
      <TagSelector tags={tags} setTags={setTags} maxTags={5} />

      {/* Privacy Selector */}
      <div className="privacy-section">
        <label className="edit-label">Privacy</label>
        <select
          className="edit-input"
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value)}
        >
          {Object.values(PRIVACY_LEVELS).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

EditCategory.propTypes = {
  categoryName: PropTypes.string,
  description: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.string),
  primaryField: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
};

export default EditCategory;
