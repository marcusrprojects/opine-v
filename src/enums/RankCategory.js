const RankCategory = Object.freeze({
  BAD: 0,
  OKAY: 1,
  GOOD: 2,
});

// Function to map enum number to the category name
export const getRankCategoryName = (rankValue) => {
  return (
    toTitleCase(
      Object.keys(RankCategory).find((key) => RankCategory[key] === rankValue)
    ) || "Unknown"
  );
};

const toTitleCase = (str) => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export default RankCategory;
