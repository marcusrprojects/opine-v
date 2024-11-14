import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import "../styles/Categories.css";
import { debounce } from 'lodash'; // For debouncing filter input
import AddButton from './AddButton';

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
    <div>
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

      <div className="category-grid">
        {filteredCategories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          filteredCategories.map((category) => {
            // Customize card color based on category properties, if needed
            // const cardColor = "var(--tertiary-color)"; // Set a default or dynamic color based on your logic

            return (
              <div 
                key={category.id} 
                className="category-card"
                onClick={() => navigate(`/categories/${category.id}`)}
              >
                {/* Header with Category Name */}
                <div className="category-header">
                  <h4 className="category-title">{category.name}</h4>
                </div>

                {/* Category Content - Attributes excluding primary field */}
                <div className="category-content">
                  {category.fields
                    .filter(field => field !== category.primaryField)
                    .join(', ')}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Button to navigate to the Create Category form */}
      <AddButton onClick={() => navigate(`/create-category`)} />
    </div>
  );
};

export default Categories;