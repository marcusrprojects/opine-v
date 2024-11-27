import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";
import PropTypes from "prop-types";
import { FaBars, FaUser, FaHome, FaSignInAlt } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  useEffect(() => {
    let timeout;
    if (sidebarOpen) {
      timeout = setTimeout(() => {
        toggleSidebar(); // Close the sidebar
      }, 4000); // 4 seconds
    }

    // Cleanup the timeout if the component unmounts or sidebarOpen changes
    return () => clearTimeout(timeout);
  }, [sidebarOpen, toggleSidebar]);

  return (
    <>
      {/* Sidebar toggle button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FaBars />
      </button>

      {/* Sidebar navigation */}
      <nav className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div id="theme-toggle">
          <ThemeToggle />
        </div>

        <Link to="/categories" title="Home" className="link-icon">
          <FaHome />
        </Link>

        <Link to="/profile" title="Profile" className="link-icon">
          <FaUser />
        </Link>

        <Link to="/login" title="Login" className="link-icon">
          <FaSignInAlt />
        </Link>
      </nav>
    </>
  );
};

Sidebar.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;