import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";
import PropTypes from "prop-types";
import { FaBars, FaUser, FaHome, FaThList } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    const resetTimeout = () => {
      clearTimeout(timeoutRef.current);
      if (sidebarOpen) {
        timeoutRef.current = setTimeout(() => {
          toggleSidebar();
        }, 2500);
      }
    };

    // Reset timeout on interaction
    const sidebarElement = document.querySelector(".sidebar");
    if (sidebarElement) {
      sidebarElement.addEventListener("mousemove", resetTimeout);
      sidebarElement.addEventListener("click", resetTimeout);
    }

    // Initial timeout
    resetTimeout();

    // Cleanup
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
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FaBars />
      </button>

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/" title="Home" className="link-icon">
          <FaHome />
        </Link>

        <Link to="/categories" title="Categories" className="link-icon">
          <FaThList />
        </Link>

        <Link to="/profile" title="Profile" className="link-icon">
          <FaUser />
        </Link>

        <div className="link-icon" title="Theme">
          <ThemeToggle />
        </div>
      </nav>
    </>
  );
};

Sidebar.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;
