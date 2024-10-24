import { Link } from "react-router-dom";
import '../styles/Sidebar.css';
import PropTypes from 'prop-types';

const Sidebar = ({ sidebarOpen }) => {
  return (
    <nav className={`sidebar ${sidebarOpen ? '' : 'hidden'}`}>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/categories">Categories</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/signup">Signup</Link></li>
      </ul>
    </nav>
  );
};


// Add PropTypes validation
Sidebar.propTypes = {
    sidebarOpen: PropTypes.bool.isRequired, // Validate that sidebarOpen is a boolean and required
};

export default Sidebar;