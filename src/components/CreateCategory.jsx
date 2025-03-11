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
  const [primaryFieldIndex, setPrimaryFieldIndex] = useState(0);
  const [tags, setTags] = useState([]); // Stores tag IDs
  const { user } = useAuth();
  const navigate = useNavigate();
  const [privacy, setPrivacy] = useState(PRIVACY_LEVELS.PUBLIC);

  const addField = () => {
    setFields([...fields, { name: "" }]);
  };

  const handleFieldChange = (index, value) => {
    const updatedFields = [...fields];
    updatedFields[index].name = value;
    setFields(updatedFields);
  };

  const handleRemoveField = (index) => {
    if (index === primaryFieldIndex) {
      alert("Please select a new primary field before deleting this one.");
      return;
    }
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    if (primaryFieldIndex > index) {
      setPrimaryFieldIndex(primaryFieldIndex - 1);
    }
  };

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
        primaryField: fields[primaryFieldIndex].name,
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
        <FieldManager
          fields={fields}
          setFields={setFields}
          primaryFieldIndex={primaryFieldIndex}
          setPrimaryFieldIndex={setPrimaryFieldIndex}
        />
        {/* <div className="attributes-group">
          <h3>Attributes</h3>
          {fields.map((field, index) => (
            <div key={index} className="field-container">
              <label className="primary-field-radio">
                <RadioInput
                  name="primaryField"
                  checked={primaryFieldIndex === index}
                  onChange={() => setPrimaryFieldIndex(index)}
                  className="primary-field"
                />
                {primaryFieldIndex === index && (
                  <span className="tooltip">Primary Field</span>
                )}
              </label>
              <TextInput
                value={field.name}
                onChange={(e) => handleFieldChange(index, e.target.value)}
                placeholder={`Field #${index + 1}`}
                required
              />
              <div className="field-actions">
                <FaMinus
                  className={`icon delete-icon ${
                    index === primaryFieldIndex
                      ? "primary-delete"
                      : "default-delete"
                  }`}
                  onClick={() => handleRemoveField(index)}
                  title="Remove field"
                />
                {index === fields.length - 1 && (
                  <FaPlus
                    className="icon add-field-icon"
                    onClick={addField}
                    title="Add field"
                  />
                )}
              </div>
            </div>
          ))}
        </div> */}

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
            onChange={(e) => setPrivacy(Number(e.target.value))} // Ensures it's stored as a number
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
