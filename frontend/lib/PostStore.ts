// lib/PostStore.ts

type Post = {
  id: string;
  name: string;
  position: string;
  timeAgo: string;
  text: string;
  hasImage: boolean;
};

let globalPosts: Post[] = [];

export const addPost = (post: Post) => {
  globalPosts.unshift(post); // Add to top
};

export const getPosts = () => {
  return globalPosts;
};
