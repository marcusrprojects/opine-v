import { useContext } from "react";
import UserCacheContext from "./UserCacheContext";

export const useUserCache = () => {
  const context = useContext(UserCacheContext);
  if (!context) {
    throw new Error("useUserCache must be used within a UserCacheProvider");
  }
  return context;
};
