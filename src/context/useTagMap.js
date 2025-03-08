import { useContext } from "react";
import { TagContext } from "./TagContext";

export const useTagMap = () => {
  const tagMap = useContext(TagContext);
  if (!tagMap) {
    throw new Error("useTagMap must be used within a TagProvider");
  }
  return tagMap;
};
