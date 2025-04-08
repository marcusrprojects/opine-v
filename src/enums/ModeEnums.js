export const AuthFormMode = Object.freeze({
  SIGNUP: "signup",
  LOGIN: "login",
});

export const CategoryCollectionMode = Object.freeze({
  OWN: "own",
  USER: "user",
  LIKED: "liked",
  LIKED_BY_USER: "likedByUser",
  ALL: "all",
  RECOMMENDED: "recommended",
  POPULAR: "popular",
  FOLLOWING: "following",
});

export const FollowListMode = Object.freeze({
  FOLLOWERS: "followers",
  FOLLOWING: "following",
  FOLLOW_REQUESTS: "follow_requests",
});

export const FollowStatus = Object.freeze({
  FOLLOWING: "following",
  PENDING: "pending",
  NONE: "none",
});
