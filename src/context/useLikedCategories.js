import { useContext } from "react";
import { LikedCategoriesContext } from "./LikedCategoriesContext";

export const useLikedCategories = () => {
  const context = useContext(LikedCategoriesContext);
  if (!context) {
    throw new Error(
      "useLikedCategories must be used within a LikedCategoriesProvider"
    );
  }
  return context;
};
