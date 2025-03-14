import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddSearchPanel from "../components/Navigation/AddSearchPanel";
import CategorySearch from "../components/CategorySearch";
import CategoryCollection from "./CategoryCollection";

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="categories-container">
      <h2>Categories</h2>
      <AddSearchPanel
        onAdd={() => navigate("/create-category")}
        onToggleSearch={() => setShowSearchBox(!showSearchBox)}
        isAddDisabled={false}
      />
      {showSearchBox && (
        <CategorySearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}
      <CategoryCollection mode="all" searchTerm={searchTerm} />
    </div>
  );
};

export default Categories;
