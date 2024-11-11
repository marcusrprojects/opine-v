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
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categoryDocRef = doc(db, 'categories', categoryId);
        const categorySnapshot = await getDoc(categoryDocRef);

        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.data();
          setFields(categoryData.fields);
          setPrimaryField(categoryData.primaryField);
          setCategoryName(categoryData.name);
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

  const handleSaveFields = async (updatedFields, newPrimaryField) => {
    setFields(updatedFields);
    setPrimaryField(newPrimaryField);
    setIsEditingCategory(false);

    try {
      const categoryDocRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryDocRef, {
        fields: updatedFields,
        primaryField: newPrimaryField,
      });
    } catch (error) {
      console.error("Error updating category fields:", error);
    }
  };

  const handleNameChange = async (newName) => {
    setCategoryName(newName);
    try {
      const categoryDocRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryDocRef, { name: newName });
    } catch (error) {
      console.error("Error updating category name:", error);
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
              onNameChange={handleNameChange} // Pass name change handler
              onSave={handleSaveFields}
              onClose={handleCloseModal}
            />
          )}

          <FaTrash className="icon delete-icon" onClick={handleDeleteCategory} />
        </div>

        <h2 className="category-title">{categoryName}</h2>

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