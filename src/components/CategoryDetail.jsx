import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // To capture category ID from URL
import { db } from '../firebaseConfig'; // Assuming firebaseConfig is outside the components folder
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { FaPlusCircle } from 'react-icons/fa'; // Import a plus icon from react-icons
import "../styles/CategoryDetail.css";

/**
 * CategoryDetail component displays the details of a specific category,
 * its items, and provides a navigation option to add a new item.
 */
const CategoryDetail = () => {
  const { categoryId } = useParams(); // Get the categoryId from the URL
  const [items, setItems] = useState([]);
  let fields = useRef([]);
  let categoryName = useRef('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * useEffect hook to fetch category details and its items when
   * the component is mounted or when the categoryId or items change.
   */
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        // Fetch category document to get fields and category name
        const categoryDocRef = doc(db, 'categories', categoryId);
        const categorySnapshot = await getDoc(categoryDocRef);

        const categoryData = categorySnapshot.data();
        fields.current = categoryData.fields;
        categoryName.current = categoryData.name;

        // Fetch the items within the category
        const categoryItemsRef = collection(db, `categories/${categoryId}/items`);
        const itemsSnapshot = await getDocs(categoryItemsRef);
        const itemList = itemsSnapshot.docs.map(doc => ({ ...doc.data() }));
        const sortedItems = itemList.sort((a, b) => b.rating - a.rating);
        setItems(sortedItems);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching items: ', error);
      }
    };

    fetchCategoryData();
  }, [categoryId, items]);

  /**
   * Handle navigation when the user clicks the button to add a new item.
   * Redirects to the add item page of the current category.
   */
  const handleAddItemClick = () => {
    navigate(`/categories/${categoryId}/add-item`);
  };

  // If data is still loading, show a loading message
  if (loading) {
    return <p>Loading items...</p>;
  }

  return (
    <div>
      <div className="category-detail-container">

        <h2 className="category-title">{categoryName.current}</h2>
        
        <div className="item-grid">
        {items.map((item, index) => {
          const rating = item.rating || 1; // Default if rating is not provided

          const lightness = 100 - rating * 7; // Adjust lightness inversely with rating

          const cardColor =
            rating >= 9
              ? `hsl(120, 40%, ${lightness}%)` // Green for high ratings, desaturated
              : rating >= 8
              ? `hsl(60, 40%, ${lightness}%)`  // Yellow for medium ratings, desaturated 
              : `hsl(0, 40%, ${lightness}%)`;  // Red for low ratings, desaturated

          return (
            <div key={index} className="item-card" style={{ borderColor: cardColor }}>
              <div className="item-header">
                <div className="item-rating" style={{borderColor: cardColor}}>{rating.toFixed(1)}</div>
                <h4 className="item-title">{item[fields.current[0]] || "Unnamed Item"}</h4>
              </div>
              
              {/* Content area with background color */}
              <div className="item-content" style={{ backgroundColor: cardColor}}>
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

      {/* Plus button to navigate to the AddItem page */}
      <button onClick={handleAddItemClick} className="add-item-button">
        <FaPlusCircle size="3em" />
      </button>
    </div>
  );
};

export default CategoryDetail;