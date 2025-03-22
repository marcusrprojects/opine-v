const AuthFormMode = Object.freeze({
  SIGNUP: "signup",
  LOGIN: "login",
});

const CategoryCollectionMode = Object.freeze({
  OWN: "own",
  USER: "user",
  LIKED: "liked",
  LIKED_BY_USER: "likedByUser",
  ALL: "all",
  RECOMMENDED: "recommended",
  POPULAR: "popular",
  FOLLOWING: "following",
});

const FollowListMode = Object.freeze({
  FOLLOWERS: "followers",
  FOLLOWING: "following",
});

export { AuthFormMode, CategoryCollectionMode, FollowListMode };
