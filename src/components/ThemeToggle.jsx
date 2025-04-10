import { useState, useEffect } from "react";
import "../styles/ThemeToggle.css";
import { FaAdjust, FaSun, FaMoon } from "react-icons/fa";
import { Link } from "react-router-dom";
import ThemeMode from "../enums/ThemeEnums";

const ThemeToggle = () => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return "auto";
  });

  useEffect(() => {
    const applyTheme = () => {
      if (themeMode === ThemeMode.AUTO) {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        document.documentElement.setAttribute(
          "data-theme",
          systemPrefersDark ? "dark" : "light"
        );
      } else {
        document.documentElement.setAttribute("data-theme", themeMode);
      }
      localStorage.setItem("theme", themeMode);
    };

    applyTheme();
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      if (prevMode === ThemeMode.AUTO) return "light";
      if (prevMode === ThemeMode.LIGHT) return "dark";
      return "auto";
    });
  };

  const getThemeIcon = () => {
    if (themeMode === ThemeMode.AUTO) return <FaAdjust />;
    if (themeMode === ThemeMode.LIGHT) return <FaSun />;
    if (themeMode === ThemeMode.DARK) return <FaMoon />;
  };

  return (
    <Link
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle Theme"
    >
      {getThemeIcon()}
    </Link>
  );
};

export default ThemeToggle;
