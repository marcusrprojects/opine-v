import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";
import PropTypes from "prop-types";
import { FaBars, FaUser, FaHome, FaSignInAlt } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    const resetTimeout = () => {
      clearTimeout(timeoutRef.current);
      if (sidebarOpen) {
        timeoutRef.current = setTimeout(() => {
          toggleSidebar(); // Close the sidebar
        }, 2500);
      }
    };

    // Reset the timeout whenever there's interaction
    const sidebarElement = document.querySelector(".sidebar");
    if (sidebarElement) {
      sidebarElement.addEventListener("mousemove", resetTimeout);
      sidebarElement.addEventListener("click", resetTimeout);
    }

    // Set an initial timeout
    resetTimeout();

    // Cleanup: Remove listeners and clear timeout
    return () => {
      clearTimeout(timeoutRef.current);
      if (sidebarElement) {
        sidebarElement.removeEventListener("mousemove", resetTimeout);
        sidebarElement.removeEventListener("click", resetTimeout);
      }
    };
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