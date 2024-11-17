import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { FaEdit, FaTrash } from 'react-icons/fa';
import "../styles/CategoryDetail.css";
import { debounce } from 'lodash';
import RankCategory from '../enums/RankCategory';
import LoadingMessages from '../enums/LoadingMessages';
import LoadingComponent from './LoadingComponent';
import EditCategoryModal from './EditCategoryModal';
import AddButton from './AddButton';

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
  const navigate = useNavigate();
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [description, setDescription] = useState(''); // Description state
  const [isEditingDescription, setIsEditingDescription] = useState(false); // Editing state for description
  const [isEditingCategoryName, setIsEditingCategoryName] = useState(false);

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
        console.error('Error fetching items:', error);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  const handleFilterChange = (field, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const handleDeleteCategory = async () => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteDoc(doc(db, 'categories', categoryId));
        navigate('/categories');
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleEditCategory = () => {
    setIsEditingCategory(true);
  };

  const handleSaveFields = async (updatedFields, newPrimaryField, newTags) => {
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
      console.error("Error updating category fields:", error);
    }
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
    setCategoryName(newName);
    setIsEditingCategoryName(false);
    try {
      const categoryDocRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryDocRef, { name: newName });
    } catch (error) {
      console.error("Error updating category name:", error);
    }
  };

  const handleDescriptionChange = async (newDescription) => {
    setDescription(newDescription);
    setIsEditingDescription(false);
    try {
      const categoryDocRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryDocRef, { description: newDescription });
    } catch (error) {
      console.error('Error updating category description:', error);
    }
  };

  if (loading) {
    return <LoadingComponent message={LoadingMessages.FETCHING} />;
  }

  return (
    <div>
      <div className="category-detail-container">
        <div className="category-actions">
          <FaEdit className="icon edit-icon" onClick={handleEditCategory} />

          {isEditingCategory && (
            <EditCategoryModal
              fields={fields}
              primaryField={primaryField}
              categoryName={categoryName} // Pass the current category name
              tags={tags}
              onSave={handleSaveFields}
              onClose={handleCloseModal}
            />
          )}

          <FaTrash className="icon delete-icon" onClick={handleDeleteCategory} />
        </div>

        <div className="category-title">
          {isEditingCategoryName ? (
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

        <div className="category-description">
          {isEditingDescription ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleDescriptionChange(description)}
              autoFocus
            />
          ) : (
            <p onClick={() => setIsEditingDescription(true)}>
              {description || "Click to add a description..."}
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
            const rating = item.rating || 1;
            const rankCategory = item.rankCategory ?? RankCategory.OKAY;
            const maxWhite = 50;
            const hues = [0, 60, 120];
            const thresholds = [0, (1 / 3) * 10, (2 / 3) * 10];
            const adjustedWhiteness = maxWhite - (rating - thresholds[rankCategory]) * (50 / 3);
            const cardColor = `hwb(${hues[rankCategory]} ${adjustedWhiteness}% 17.5%)`;
            const itemId = item.id;

            return (
              <div 
                key={itemId} 
                className="item-card"
                style={{ borderColor: cardColor }} 
                onClick={() => handleItemClick(itemId, cardColor)}
              >
                <div className="item-header">
                  <div className="item-rating" style={{ borderColor: cardColor }}>{rating.toFixed(1)}</div>
                  <h4 className="item-title">{item[primaryField] || "Unnamed Item"}</h4>
                </div>
                <div className="item-content" style={{ backgroundColor: cardColor }}>
                  {fields.filter(field => field !== primaryField).map((field, fieldIndex) => (
                    <p key={fieldIndex}>
                      {field}: {item[field] || "N/A"}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddButton onClick={() => navigate(`/categories/${categoryId}/add-item`)} />
      <br></br>
      {/* Back Button */}
      <button onClick={() => navigate('/categories')} className="back-button">
        Back
      </button>
    </div>
  );
};

export default CategoryDetail;