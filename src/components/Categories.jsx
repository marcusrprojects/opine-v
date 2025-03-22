import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddSearchPanel from "../components/Navigation/AddSearchPanel";
import CategorySearch from "../components/CategorySearch";
import CategoryCollection from "./CategoryCollection";
import SortOptions from "../enums/SortOptions";
import { CategoryCollectionMode } from "../enums/ModeEnums";

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState(SortOptions.UPDATED_DESC);

  return (
    <div className="categories-container">
      <h2>Categories</h2>
      <AddSearchPanel
        onAdd={() => navigate("/create-category")}
        onToggleSearch={() => setShowSearchBox(!showSearchBox)}
        isAddDisabled={false}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
      {showSearchBox && (
        <CategorySearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}
      <CategoryCollection
        mode={CategoryCollectionMode.ALL}
        searchTerm={searchTerm}
        sortOption={sortOption}
      />
    </div>
  );
};

export default Categories;
