import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { FaPlusCircle } from 'react-icons/fa';
import "../styles/CategoryDetail.css";
import { debounce } from 'lodash'; // To debounce filtering
import RankCategory from '../enums/RankCategory';

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filters, setFilters] = useState({});
  const fields = useRef([]);
  const categoryName = useRef('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const categoryDocRef = doc(db, 'categories', categoryId);
        const categorySnapshot = await getDoc(categoryDocRef);

        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.data();
          fields.current = categoryData.fields;
          categoryName.current = categoryData.name;
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

  const applyFilters = debounce(() => {
    const filtered = items.filter(item => {
      return Object.keys(filters).every(field => {
        const filterValue = filters[field].toLowerCase();
        const itemValue = item[field]?.toString().toLowerCase();
        return itemValue?.includes(filterValue);
      });
    });
    setFilteredItems(filtered);
  }, 300); // Adjust debounce timing as necessary

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  if (loading) {
    return <p>Loading items...</p>;
  }

  return (
    <div>
      <div className="category-detail-container">
        <h2 className="category-title">{categoryName.current}</h2>

        <div className="filters">
          {fields.current.map((field, index) => (
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
          {filteredItems.map((item, index) => {
            const rating = item.rating || 1;
            const rankCategory = item.rankCategory ?? RankCategory.OKAY; // Default to 'Okay' category if undefined
            
            const maxLightness = 100;
            const hues = [0, 60, 120]; // HSL hues for Bad (0), Okay (60), Good (120)
            const thresholds = [0, (1 / 3) * 10, (2 / 3) * 10]; // Rating thresholds for each category
            
            const adjustedLightness = maxLightness - (rating - thresholds[rankCategory]) * 15 - 25;
            const cardColor = `hsl(${hues[rankCategory]}, 40%, ${adjustedLightness}%)`;


            return (
              <div key={index} className="item-card" style={{ borderColor: cardColor }}>
                <div className="item-header">
                  <div className="item-rating" style={{ borderColor: cardColor }}>{rating.toFixed(1)}</div>
                  <h4 className="item-title">{item[fields.current[0]] || "Unnamed Item"}</h4>
                </div>
                <div className="item-content" style={{ backgroundColor: cardColor }}>
                  {fields.current.slice(1).map((field, fieldIndex) => (
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

      <button onClick={() => navigate(`/categories/${categoryId}/add-item`)} className="add-item-button">
        <FaPlusCircle size="3em" />
      </button>
    </div>
  );
};

export default CategoryDetail;