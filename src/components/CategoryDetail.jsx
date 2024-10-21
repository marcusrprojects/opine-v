import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // To capture category ID from URL
import { db } from '../firebaseConfig'; // Assuming firebaseConfig is outside the components folder
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { FaPlusCircle } from 'react-icons/fa'; // Import a plus icon from react-icons

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
        setItems(itemList);

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
      {/* Use the category name from the document */}
      <h2>{categoryName.current}</h2>
      <div className="item-grid">
        {items.map((item, index) => (
          <div key={index} className="item-tile">
            {/* Display the first field (assumed 'name') as the title */}
            <h4>{item[fields.current[0]] || "Unnamed Item"}</h4>
            {/* Display other fields below */}
            {Object.keys(item).map((key) => (
              key !== fields.current[0] && (
                <p key={key}>
                  {key}: {item[key]}
                </p>
              )
            ))}
          </div>
        ))}
      </div>

      {/* Plus button to navigate to the AddItem page */}
      <button onClick={handleAddItemClick}>
        <FaPlusCircle size="2em" />
      </button>
    </div>
  );
};

export default CategoryDetail;