import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import ItemList from "./ItemList";
import CategoryPanel from "./Navigation/CategoryPanel";

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [primaryField, setPrimaryField] = useState(null);
  const [orderedFields, setOrderedFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const categoryDocRef = doc(db, "categories", categoryId);
        const categorySnapshot = await getDoc(categoryDocRef);
        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.data();
          setCategory(categoryData);
          setPrimaryField(categoryData.primaryField);
          setOrderedFields(categoryData.fields || []);
        }
      } catch (error) {
        console.error("Error fetching category details:", error);
      }
    };

    const fetchItems = async () => {
      try {
        const itemsCollectionRef = collection(
          db,
          `categories/${categoryId}/items`
        );
        const itemsSnapshot = await getDocs(itemsCollectionRef);
        const itemList = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // ✅ Sort items before setting state
        const sortedItems = [...itemList].sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating; // ✅ Highest-rated first
          }
          return b.rankCategory - a.rankCategory; // ✅ Tie-breaker by rank
        });

        setItems(sortedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchCategory();
    fetchItems();
    setLoading(false);
  }, [categoryId]);

  if (loading) {
    return <p>Loading category details...</p>;
  }

  if (!category) {
    return <p>Category not found.</p>;
  }

  const handleItemClick = (itemId) => {
    navigate(`/categories/${categoryId}/items/${itemId}`);
  };

  const handleBack = () => navigate("/categories");
  const handleAddItem = () => navigate(`/categories/${categoryId}/add-item`);

  return (
    <div className="category-detail-container">
      <CategoryPanel
        onBack={handleBack}
        onAdd={handleAddItem}
        isAddDisabled={false}
      />
      <h2>{category.name}</h2>
      <p className="category-description">
        {category.description || "No description available."}
      </p>
      <ItemList
        items={items}
        primaryField={primaryField}
        orderedFields={orderedFields}
        onItemClick={handleItemClick}
      />
    </div>
  );
};

export default CategoryDetail;
