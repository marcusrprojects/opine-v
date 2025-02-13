import PropTypes from "prop-types";
import CardList from "./CardList";
import CategoryCard from "./CategoryCard";
import "../styles/CategoryList.css";

const CategoryList = ({
  categories,
  onCategoryClick,
  onLike,
  likedCategories,
}) => {
  return (
    <CardList
      items={categories}
      renderCard={(category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={() => onCategoryClick(category.id)}
          onLike={() => onLike(category.id)}
          liked={likedCategories.includes(category.id)}
        />
      )}
    />
  );
};

CategoryList.propTypes = {
  categories: PropTypes.array.isRequired,
  onCategoryClick: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  likedCategories: PropTypes.array.isRequired,
};

export default CategoryList;
