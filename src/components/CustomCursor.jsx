// src/components/CustomCursor.jsx
import { useEffect, useRef } from "react";
// import "../styles/Cursor.css";

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    const move = (e) => {
      cursor.style.top = `${e.clientY}px`;
      cursor.style.left = `${e.clientX}px`;
    };

    const down = () => cursor.classList.add("clicking");
    const up = () => cursor.classList.remove("clicking");

    document.addEventListener("mousemove", move);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mousedown", down);
      document.removeEventListener("mouseup", up);
    };
  }, []);

  return <div ref={cursorRef} className="cursor" />;
};

export default CustomCursor;
