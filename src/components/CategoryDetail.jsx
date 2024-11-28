import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { FaEdit, FaTrash, FaHeart, FaRegHeart } from 'react-icons/fa';
import "../styles/CategoryDetail.css";
import { debounce } from 'lodash';
import RankCategory from '../enums/RankCategory';
import LoadingMessages from '../enums/LoadingMessages';
import LoadingComponent from './LoadingComponent';
import EditCategoryModal from './EditCategoryModal';
import AddButton from './AddButton';
import { useAuth } from '../context/useAuth';
import { calculateCardColor } from '../utils/ranking';
import {handleError} from '../utils/errorUtils';

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filters, setFilters] = useState({});
  const [fields, setFields] = useState([]);
  const [primaryField, setPrimaryField] = useState('');
  const [tags, setTags] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false); // State to track if the board is liked
  const navigate = useNavigate();
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [description, setDescription] = useState(''); // Description state
  const [creatorId, setCreatorId] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false); // Editing state for description
  const [isEditingCategoryName, setIsEditingCategoryName] = useState(false);

  const { user } = useAuth(); // Access the user state from useAuth

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categoryDocRef = doc(db, 'categories', categoryId);
        const categorySnapshot = await getDoc(categoryDocRef);

        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.data();
          setFields(categoryData.fields);
          setPrimaryField(categoryData.primaryField);
          setTags(categoryData.tags);
          setCategoryName(categoryData.name);
          setDescription(categoryData.description || '');
          setCreatorId(categoryData.createdBy);
        }

        const itemsSnapshot = await getDocs(collection(db, `categories/${categoryId}/items`));
        const itemList = itemsSnapshot.docs.map(doc => ({ ...doc.data() }));
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
        handleError(error, 'Error fetching items.');
      }
    };

    const fetchLikedState = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setLiked(userData.likedCategories?.includes(categoryId));
        }
      } catch (error) {
        handleError(error, 'Error fetching liked state.');
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
      const userDocRef = doc(db, 'users', user.uid);

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
      handleError(error, 'Error updating like state.');
    }
  };

  const canEdit = useMemo(() => {
    return user && user.uid === creatorId;
  }, [user, creatorId]);

  const handleFilterChange = (field, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: value,
    }));
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
          await deleteDoc(doc(db, 'categories', categoryId));
          navigate('/categories');
        } catch (error) {
          handleError(error, "Error deleting category.");
        }
      }
    });
  };

  const handleEditCategory = () => {
    setIsEditingCategory(true);
  };

  const handleSaveFields = async (updatedFields, newPrimaryField, newTags) => {
    await canEditAction(async () => {
      setFields(updatedFields);
      setPrimaryField(newPrimaryField);
      setTags(newTags);
      setIsEditingCategory(false);
      
      try {
        const categoryDocRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryDocRef, {
          fields: updatedFields,
          primaryField: newPrimaryField,
          tags: newTags
        });
      } catch (error) {
        handleError(error, "Error updating category fields.");
      }
    });
  };

  const handleCloseModal = () => {
    setIsEditingCategory(false);
  };

  const applyFilters = debounce(() => {
    const filtered = items.filter(item => {
      return Object.keys(filters).every(field => {
        const filterValue = filters[field].toLowerCase();
        const itemValue = item[field]?.toString().toLowerCase();
        return itemValue?.includes(filterValue);
      });
    });
    setFilteredItems(filtered);
  }, 300);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  const handleItemClick = (itemId, cardColor) => {
    navigate(`./item/${itemId}`, { state: { cardColor } });
  };

  const handleNameChange = async (newName) => {
    await canEditAction(async () => {
      setCategoryName(newName);
      setIsEditingCategoryName(false);
      try {
        const categoryDocRef = doc(db, 'categories', categoryId);
        await updateDoc(categoryDocRef, { name: newName });
      } catch (error) {
        handleError(error, "Error updating category name.");
      }
    }); 
  };

  const handleDescriptionChange = async (newDescription) => {
    setDescription(newDescription);
    setIsEditingDescription(false);
    try {
      const categoryDocRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryDocRef, { description: newDescription });
    } catch (error) {
      handleError(error, 'Error updating category description.');
    }
  };

  if (loading) {
    return <LoadingComponent message={LoadingMessages.FETCHING} />;
  }

  return (
    <div>
      <div className="category-detail-container">
        <div className="category-actions">
          <div className="like-container">
            {liked ? (
              <FaHeart className="icon like-icon" onClick={toggleLike} />
            ) : (
              <FaRegHeart className="icon like-icon" onClick={toggleLike} />
            )}
          </div>
          {canEdit &&
            <div className={`${canEdit ? 'editable' : 'non-editable'} cheese`}>
              <FaEdit className="icon edit-icon" onClick={handleEditCategory} />

              {isEditingCategory && (
                <EditCategoryModal
                  fields={fields}
                  primaryField={primaryField}
                  categoryName={categoryName}
                  tags={tags}
                  onSave={handleSaveFields}
                  onClose={handleCloseModal}
                />
              )}

              <FaTrash className="icon delete-icon" onClick={handleDeleteCategory} />
            </div>
            }
          </div>

        <div className={`category-title ${canEdit ? 'editable' : 'non-editable'}`}>
          {canEdit && isEditingCategoryName ? (
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onBlur={() => handleNameChange(categoryName)}
              autoFocus
            />
          ) : (
            <h2 onClick={() => setIsEditingCategoryName(true)}>
              {categoryName || "Click to add a title..."}
            </h2>
          )}
        </div>

        {/* Editable Description */}
        <div className={`category-description ${canEdit ? 'editable' : 'non-editable'}`}>
          {canEdit && isEditingDescription ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleDescriptionChange(description)}
              autoFocus
            />
          ) : (
            <p onClick={() => canEdit && setIsEditingDescription(true)}>
              {description || (canEdit ? "Click to add a description..." : "")}
            </p>
          )}
        </div>

        <div className="filters">
          {fields.map((field, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Filter by ${field}`}
              value={filters[field] || ''}
              onChange={(e) => handleFilterChange(field, e.target.value)}
            />
          ))}
        </div>

        <div className="item-grid">
          {filteredItems.map((item) => {
            const rating = item.rating !== undefined ? item.rating : 1;
            const itemId = item.id;
            const cardColor = calculateCardColor(rating, item.rankCategory ?? RankCategory.OKAY);

            return (
              <div 
                key={itemId} 
                className="item-card"
                onClick={() => handleItemClick(itemId, cardColor)}
              >
                <div className="item-header">
                  <div className="item-rating" style={{ backgroundColor: cardColor }}>{rating.toFixed(1)}</div>
                  <h4 className="item-title">{item[primaryField] || "Unnamed Item"}</h4>
                </div>
                <div className="item-content">
                  {fields.filter(field => field !== primaryField).map((field, fieldIndex) => (
                    <p key={fieldIndex} className="field-pair">
                      <span className="attribute-string">{field}:</span> <span className="attribute-value" style={{ color: cardColor}}>{item[field] || "N/A"}</span>
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* <AddButton onClick={() => navigate(`/categories/${categoryId}/add-item`)} className='good'/> */}
      <AddButton
        onClick={() =>
          canEditAction(() => navigate(`/categories/${categoryId}/add-item`))
        }
      />
      <br></br>
      {/* Back Button */}
      <button onClick={() => navigate('/categories')} className="back-button">
        Back
      </button>
    </div>
  );
};

export default CategoryDetail;