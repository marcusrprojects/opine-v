import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // To capture category ID from URL
import { db } from '../firebaseConfig'; // Assuming firebaseConfig is outside the components folder
import { collection, doc, getDoc, getDocs, addDoc } from 'firebase/firestore';
import AddItem from './AddItem'; // A reusable form component to add items
import { FaPlusCircle } from 'react-icons/fa'; // Import a plus icon from react-icons

const CategoryDetail = () => {
  const { categoryId } = useParams(); // Get the categoryId from the URL
  const [items, setItems] = useState([]);
  let fields = useRef([]);
  let categoryName = useRef('');
  const [loading, setLoading] = useState(true);
  const [showAddItemForm, setShowAddItemForm] = useState(false); // State to toggle form

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
  }, [categoryId]);

  const handleAddItem = async (newItem) => {
    try {
      const categoryItemsRef = collection(db, `categories/${categoryId}/items`);
      await addDoc(categoryItemsRef, newItem);
      setItems(prevItems => [...prevItems, newItem]); // Update state with new item
      setShowAddItemForm(false); // Hide form after adding item
    } catch (error) {
      console.error('Error adding new item: ', error);
    }
  };

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

      {/* Add new item form - controlled by state */}
      {!showAddItemForm ? (
        <div onClick={() => setShowAddItemForm(true)} style={{ cursor: 'pointer', display: 'inline-block' }}>
          <FaPlusCircle size={30} /> {/* Plus icon */}
          <span>Add New Item</span>
        </div>
      ) : (
        <AddItem categoryId={categoryId} onAddItem={handleAddItem} />
      )}
    </div>
  );
};

export default CategoryDetail;