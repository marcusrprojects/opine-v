import CategoryCollection from "./CategoryCollection";

const Feed = () => {
  return (
    <div className="feed-container">
      <h2>Recommended for You</h2>
      <CategoryCollection mode="recommended" />

      <h2>Popular Categories</h2>
      <CategoryCollection mode="popular" />

      <h2>All Categories</h2>
      <CategoryCollection mode="all" />
    </div>
  );
};

export default Feed;
