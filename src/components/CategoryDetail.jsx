import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To capture category ID from URL
import { db } from '../firebaseConfig'; // Assuming firebaseConfig is outside the components folder
import { collection, getDocs, addDoc } from 'firebase/firestore';
import AddItem from './AddItem'; // A reusable form component to add items

const CategoryDetail = () => {
  const { categoryId } = useParams(); // Get the categoryId from the URL
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const categoryItemsRef = collection(db, `categories/${categoryId}/items`);
        const snapshot = await getDocs(categoryItemsRef);
        const itemList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(itemList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items: ', error);
      }
    };

    fetchItems();
  }, [categoryId]);

  const handleAddItem = async (newItem) => {
    try {
      const categoryItemsRef = collection(db, `categories/${categoryId}/items`);
      await addDoc(categoryItemsRef, newItem);
      setItems(prevItems => [...prevItems, newItem]); // Update state with new item
    } catch (error) {
      console.error('Error adding new item: ', error);
    }
  };

  if (loading) {
    return <p>Loading items...</p>;
  }

  return (
    <div>
      <h2>{categoryId} Details</h2>

      <h3>Items in {categoryId}:</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {Object.keys(item).map((key) => (
              <span key={key}>
                {key}: {item[key]}{" "}
              </span>
            ))}
          </li>
        ))}
      </ul>

      <h3>Add New Item to {categoryId}:</h3>
      <AddItem categoryId={categoryId} onAddItem={handleAddItem} />
    </div>
  );
};

export default CategoryDetail;