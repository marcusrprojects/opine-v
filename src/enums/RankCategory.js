const RankCategory = Object.freeze({
  BAD: 0,
  OKAY: 1,
  GOOD: 2,
});

// Function to map enum number to the category name
export const getRankCategoryName = (rankValue) => {
  return (
    Object.keys(RankCategory).find((key) => RankCategory[key] === rankValue) ||
    "Unknown"
  );
};

export default RankCategory;
