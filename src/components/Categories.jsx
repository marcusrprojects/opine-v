import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom'; // Link to navigate to other routes

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from Firestore when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, 'categories'));
        const categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id, // Document ID for referencing later
          ...doc.data(), // All the other fields in the document (like 'name')
        }));
        setCategories(categoryList);
        setLoading(false); // Data has been fetched
      } catch (error) {
        console.error('Error fetching categories: ', error);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []); // Empty dependency array means it runs once on component mount

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          categories.map((category) => (
            <li key={category.id}>
              {/* Link to the specific category page */}
              <Link to={`/categories/${category.id}`}>{category.name}</Link>
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