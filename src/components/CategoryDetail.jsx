import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import CategoryPanel from "./CategoryPanel";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {
  FaEdit,
  FaTrash,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaCog,
} from "react-icons/fa";
import "../styles/CategoryDetail.css";
import { debounce } from "lodash";
import RankCategory from "../enums/RankCategory";
import LoadingMessages from "../enums/LoadingMessages";
import LoadingComponent from "./LoadingComponent";
import AddButton from "./AddButton";
import { useAuth } from "../context/useAuth";
import { calculateCardColor } from "../utils/ranking";
import { handleError } from "../utils/errorUtils";

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filters, setFilters] = useState({});
  const [fields, setFields] = useState([]);
  const [primaryField, setPrimaryField] = useState("");
  const [tags, setTags] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [creatorUsername, setCreatorUsername] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterFields, setFilterFields] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categoryDocRef = doc(db, "categories", categoryId);
        const categorySnapshot = await getDoc(categoryDocRef);

        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.data();
          setFields(categoryData.fields);
          setPrimaryField(categoryData.primaryField);
          setTags(categoryData.tags);
          setCategoryName(categoryData.name);
          setDescription(categoryData.description || "");
          setCreatorId(categoryData.createdBy);

          // Fetch the creator's username
          const creatorDocRef = doc(db, "users", categoryData.createdBy);
          const creatorSnapshot = await getDoc(creatorDocRef);
          if (creatorSnapshot.exists()) {
            const creatorData = creatorSnapshot.data();
            setCreatorUsername(creatorData.username || "Unknown User");
          }
        }

        const itemsSnapshot = await getDocs(
          collection(db, `categories/${categoryId}/items`)
        );
        const itemList = itemsSnapshot.docs.map((doc) => ({ ...doc.data() }));
        const sortedItems = itemList.sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return b.rankCategory - a.rankCategory;
        });
        setItems(sortedItems);
        setFilteredItems(sortedItems);
        setLoading(false);
      } catch (error) {
        handleError(error, "Error fetching items.");
      }
    };

    const fetchLikedState = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setLiked(userData.likedCategories?.includes(categoryId));
        }
      } catch (error) {
        handleError(error, "Error fetching liked state.");
      }
    };

    fetchCategoryData();
    fetchLikedState();
  }, [categoryId, user]);

  const toggleLike = async () => {
    if (!user) {
      alert("You must be logged in to like a board.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      if (liked) {
        await updateDoc(userDocRef, {
          likedCategories: arrayRemove(categoryId),
        });
      } else {
        await updateDoc(userDocRef, {
          likedCategories: arrayUnion(categoryId),
        });
      }

      setLiked(!liked);
    } catch (error) {
      handleError(error, "Error updating like state.");
    }
  };

  const canEdit = useMemo(() => {
    return user && user.uid === creatorId;
  }, [user, creatorId]);

  const handleSettingsToggle = () => {
    setSettingsOpen((prev) => {
      if (prev) {
        setFilterOpen(false); // Turn off the filter when settings are closed
      }
      return !prev;
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const handleFilterFieldChange = (field) => {
    setFilterFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const canEditAction = async (action) => {
    if (!canEdit) {
      alert("You do not have permission to perform this action.");
      return false;
    }
    await action();
    return true;
  };

  const handleDeleteCategory = async () => {
    await canEditAction(async () => {
      if (window.confirm("Are you sure you want to delete this category?")) {
        try {
          await deleteDoc(doc(db, "categories", categoryId));
          navigate("/categories");
        } catch (error) {
          handleError(error, "Error deleting category.");
        }
      }
    });
  };

  const toggleFilter = () => {
    setFilterOpen((prev) => !prev);
  };

  const applyFilters = debounce(() => {
    const filtered = items.filter((item) =>
      filterFields.every((field) =>
        (item[field] || "")
          .toString()
          .toLowerCase()
          .includes(filters[field]?.toLowerCase() || "")
      )
    );
    setFilteredItems(filtered);
  }, 300);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters, filterFields]);

  const handleItemClick = (itemId, cardColor) => {
    navigate(`./item/${itemId}`, { state: { cardColor } });
  };

  useEffect(() => {
    let timeoutId;

    if (settingsOpen && !filterOpen) {
      timeoutId = setTimeout(() => {
        setSettingsOpen(false);
      }, 4000);
    }

    return () => clearTimeout(timeoutId);
  }, [settingsOpen, filterOpen]);

  if (loading) {
    return <LoadingComponent message={LoadingMessages.FETCHING} />;
  }

  const handleBack = () => navigate("/categories");
  const handleAddItem = () => navigate(`/categories/${categoryId}/add-item`);

  return (
    <div>
      <div className="category-detail-container">
        <CategoryPanel
          onBack={handleBack}
          onAdd={handleAddItem}
          isAddDisabled={false}
        />
        <div className="category-detail-header">
          <h2 className="category-title"> {categoryName} </h2>
          <p className="username">@{creatorUsername}</p>
          <p className="category-description">{description}</p>
        </div>

        <div className="settings-actions-container">
          <button className="settings-toggle" onClick={handleSettingsToggle}>
            <FaCog />
          </button>

          <div className={`category-actions ${settingsOpen ? "open" : ""}`}>
            <FaFilter
              className={`icon ${filterOpen ? "filter-active" : ""}`}
              onClick={toggleFilter}
            />

            {liked ? (
              <FaHeart className="icon liked" onClick={toggleLike} />
            ) : (
              <FaRegHeart className="icon" onClick={toggleLike} />
            )}
            {/* <FaEdit className="icon" onClick={handleEditCategory} /> */}
            <FaEdit
              className="icon"
              onClick={() =>
                navigate(`/categories/${categoryId}/edit`, {
                  state: {
                    categoryName,
                    description,
                    fields,
                    primaryField,
                    tags,
                    creatorUsername,
                  },
                })
              }
            />

            {canEdit && (
              <FaTrash
                className={`icon ${canEdit ? "editable" : "non-editable"}`}
                onClick={handleDeleteCategory}
              />
            )}

            {settingsOpen && filterOpen && (
              <div className="filter-checkboxes">
                {fields.map((field, index) => (
                  <div key={index} className="filter-checkbox-container">
                    <label className="filter-field">
                      <input
                        type="checkbox"
                        checked={filterFields.includes(field)}
                        onChange={() => handleFilterFieldChange(field)}
                      />
                      {field}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {settingsOpen && filterOpen && (
          <div className="filter">
            <div className="filter-inputs">
              {filterFields.map((field) => (
                <div key={field} className="filter-input-container">
                  <input
                    type="text"
                    placeholder={`Filter by ${field}`}
                    value={filters[field] || ""}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                    className="filters"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="item-grid">
          {filteredItems.map((item) => {
            const rating = item.rating !== undefined ? item.rating : 1;
            const itemId = item.id;
            const cardColor = calculateCardColor(
              rating,
              item.rankCategory ?? RankCategory.OKAY
            );

            return (
              <div
                key={itemId}
                className="item-card"
                onClick={() => handleItemClick(itemId, cardColor)}
              >
                <div className="item-header">
                  <span className="item-rating" style={{ color: cardColor }}>
                    {rating.toFixed(1)}
                    {/* {(Math.floor(rating * 10) / 10).toFixed(1)} */}
                  </span>
                  <h4 className="item-title">
                    {item[primaryField] || "Unnamed Item"}
                  </h4>
                </div>
                {Object.keys(fields || {}).length > 1 && (
                  <div className="item-content">
                    {fields
                      .filter((field) => field !== primaryField)
                      .map((field, fieldIndex) => (
                        <span key={fieldIndex} className="attribute-value">
                          {item[field] || "N/A"}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AddButton
        onClick={() =>
          canEditAction(() => navigate(`/categories/${categoryId}/add-item`))
        }
      />
      <br></br>
      {/* Back Button */}
      {/* <button onClick={() => navigate("/categories")} className="back-button">
        Back
      </button> */}
    </div>
  );
};

export default CategoryDetail;
