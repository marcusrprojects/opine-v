import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import "../styles/Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, 'categories'));
        const categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id, 
          ...doc.data(),
        }));
        setCategories(categoryList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories: ', error);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div className="category-grid">
      <h2>Categories</h2>
      <ul>
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          categories.map((category) => (
            <li key={category.id}>
              {/* Make the entire list item clickable */}
              <Link to={`/categories/${category.id}`} className="category-card">
                {category.name}
              </Link>
            </li>
          ))
        )}
      </ul>

      {/* Button to navigate to the Create Category form */}
      <Link to="/create-category">
        <button>Create New Category</button>
      </Link>
    </div>
  );
};

export default Categories;