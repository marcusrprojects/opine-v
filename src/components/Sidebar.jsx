import { Link } from "react-router-dom";
import '../styles/Sidebar.css';
import PropTypes from 'prop-types';
import { FaBars } from "react-icons/fa";
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  return (
    <>
      {/* Sidebar toggle button */}
      <button className={`sidebar-toggle ${sidebarOpen ? '' : 'move-left'}`} onClick={toggleSidebar}>
        {<FaBars />}
      </button>

      {/* Sidebar navigation */}
      <nav className={`sidebar ${sidebarOpen ? '' : 'hidden'}`}>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/categories">Categories</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/signup">Signup</Link></li>
          <li><ThemeToggle /></li>
        </ul>
      </nav>
    </>
  );
};


// Add PropTypes validation
Sidebar.propTypes = {
    sidebarOpen: PropTypes.bool.isRequired, // Validate that sidebarOpen is a boolean and required
    toggleSidebar: PropTypes.func.isRequired
};

export default Sidebar;