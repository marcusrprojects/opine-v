import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/Categories.css";
import { debounce } from 'lodash'; // For debouncing filter input
import { FaPlusCircle } from 'react-icons/fa';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, 'categories'));
        const categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);
        setFilteredCategories(categoryList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories: ', error);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Handle input change and apply filter
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    applyFilter(value);
  };

  // Debounced function to apply filtering
  const applyFilter = debounce((value) => {
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, 300); // Debounce to avoid excessive re-rendering

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div className="category-grid">
      <h2>Categories</h2>
      
      {/* Filter input */}
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by name"
          value={filter}
          onChange={handleFilterChange}
        />
      </div>

      <ul>
        {filteredCategories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          filteredCategories.map((category) => (
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
      <button onClick={() => navigate(`/create-category`)} className="add-item-button">
        <FaPlusCircle size="3em" />
      </button>
    </div>
  );
};

export default Categories;