import CategoryCollection from "./CategoryCollection";

const Feed = () => {
  return (
    <div className="feed-container">
      <h2>Recommended For You</h2>
      <CategoryCollection mode="recommended" />

      <h2>Popular Categories</h2>
      <CategoryCollection mode="popular" />
    </div>
  );
};

export default Feed;
