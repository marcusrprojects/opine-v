import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import "../styles/EditCategory.css";
import { handleError } from "../utils/errorUtils";
import TagSelector from "./TagSelector";
import ActionPanel from "./Navigation/ActionPanel";
import TextInput from "./TextInput";
import { CategoryPrivacy } from "../enums/PrivacyEnums";
import FieldManager from "./FieldManager";
import { MAX_DESCRIPTION_LENGTH } from "../constants/CategoryConstants";
import { canUserViewCategory } from "../utils/privacyUtils";
import { useAuth } from "../context/useAuth";
import { useUserData } from "../context/useUserData";
import TierSettings from "./TierSettings";
import { recalcAllRankingsForCategoryByRating } from "../utils/ranking";
import { generateId } from "../utils/fieldsUtils";

const EditCategory = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFollowing } = useUserData();

  const category = location.state?.category ?? {};

  const [categoryName, setCategoryName] = useState(category.name ?? "");
  const [description, setDescription] = useState(category.description ?? "");
  // Transform fetched fields if necessary: if a field is a simple string or missing id/active, wrap it.
  const initialFields = Array.isArray(category.fields)
    ? category.fields.map((field) =>
        typeof field === "object" && field.name !== undefined
          ? {
              id: field.id || generateId(),
              name: field.name,
              active: field.active !== undefined ? field.active : true,
            }
          : {
              id: generateId(),
              name: field,
              active: true,
            }
      )
    : [];
  const [fields, setFields] = useState(initialFields);
  const [tags, setTags] = useState(category.tags ?? []);
  const [categoryPrivacy, setCategoryPrivacy] = useState(
    category.categoryPrivacy ?? CategoryPrivacy.DEFAULT
  );
  const [tiers, setTiers] = useState(
    Array.isArray(category.tiers) ? category.tiers : []
  );
  const [loading, setLoading] = useState(Object.keys(category).length === 0);

  useEffect(() => {
    if (!location.state || !user) {
      const fetchCategoryData = async () => {
        try {
          const categoryDocRef = doc(db, "categories", categoryId);
          const categorySnapshot = await getDoc(categoryDocRef);
          if (categorySnapshot.exists()) {
            const data = categorySnapshot.data();
            if (!canUserViewCategory(data, user, isFollowing(data.createdBy))) {
              navigate("/categories");
              return;
            }
            setCategoryName(data.name || "");
            setDescription(data.description || "");
            const fetchedFields = Array.isArray(data.fields)
              ? data.fields.map((field) =>
                  typeof field === "object" && field.name !== undefined
                    ? {
                        id: field.id || generateId(),
                        name: field.name,
                        active:
                          field.active !== undefined ? field.active : true,
                      }
                    : {
                        id: generateId(),
                        name: field,
                        active: true,
                      }
                )
              : [];
            setFields(fetchedFields);
            setTags(data.tags ?? []);
            setCategoryPrivacy(data.categoryPrivacy || CategoryPrivacy.DEFAULT);
            setTiers(data.tiers ?? []);
            setLoading(false);
          }
        } catch (error) {
          console.warn(`${error}, Error fetching category data`);
        }
      };
      fetchCategoryData();
    }
  }, [categoryId, location.state, isFollowing, navigate, user]);

  // Toggle category privacy.
  const handleTogglePrivacy = () => {
    setCategoryPrivacy((prev) =>
      prev === CategoryPrivacy.ONLY_ME
        ? CategoryPrivacy.DEFAULT
        : CategoryPrivacy.ONLY_ME
    );
  };

  // Validate using only active fields.
  const activeFields = fields.filter((field) => field.active);
  const isConfirmDisabled =
    !categoryName.trim() ||
    activeFields.length === 0 ||
    tags.length === 0 ||
    activeFields.some((field) => !field.name.trim());

  const handleSave = async () => {
    if (!categoryName.trim()) {
      alert("Category name is required.");
      return;
    }
    if (activeFields.length === 0) {
      alert("At least one active field is required.");
      return;
    }
    try {
      const categoryDocRef = doc(db, "categories", categoryId);
      await updateDoc(categoryDocRef, {
        name: categoryName.trim(),
        description,
        fields,
        tags,
        categoryPrivacy,
        tiers,
        updatedAt: Timestamp.now(),
      });
      await recalcAllRankingsForCategoryByRating(categoryId, tiers);
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      handleError(error, "Error saving category.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="edit-category-container">
      <ActionPanel
        onCancel={() => navigate(`/categories/${categoryId}`)}
        onConfirm={handleSave}
        isConfirmDisabled={isConfirmDisabled}
        onTogglePrivacy={handleTogglePrivacy}
        privacy={categoryPrivacy}
      />
      <h2 className="edit-category-title">{categoryName || "Edit Category"}</h2>
      <div className="edit-section">
        <label className="edit-label">Title</label>
        <TextInput
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category Name"
        />
        <label className="edit-label">Description</label>
        <p className="mini-text">{description.length}/500</p>
        <textarea
          className="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your category..."
          rows={4}
          maxLength={MAX_DESCRIPTION_LENGTH}
        />
      </div>
      <FieldManager fields={fields} setFields={setFields} />
      <div className="tags-group">
        <label className="edit-label">Tags</label>
        <TagSelector tags={tags} setTags={setTags} db={db} maxTags={5} />
      </div>
      <label className="edit-label">Tier Settings</label>
      <TierSettings tiers={tiers} setTiers={setTiers} />
    </div>
  );
};

EditCategory.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        id: PropTypes.string,
        active: PropTypes.bool,
      })
    ),
    tags: PropTypes.arrayOf(PropTypes.string),
    categoryPrivacy: PropTypes.string,
    tiers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        cutoff: PropTypes.number.isRequired,
      })
    ),
  }),
};

export default EditCategory;
