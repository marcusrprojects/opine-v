import CategoryCollection from "./CategoryCollection";
import { CategoryCollectionMode } from "../enums/ModeEnums";

const Feed = () => {
  return (
    <div className="feed-container">
      <h2>Following</h2>
      <CategoryCollection mode={CategoryCollectionMode.FOLLOWING} />

      <h2>Recommended For You</h2>
      <CategoryCollection mode={CategoryCollectionMode.RECOMMENDED} />

      <h2>Popular Categories</h2>
      <CategoryCollection mode={CategoryCollectionMode.POPULAR} />
    </div>
  );
};

export default Feed;
