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

export const deletePost = (postId: string) => {
  globalPosts = globalPosts.filter((p) => p.id !== postId);
};

export const updatePost = (postId: string, updatedText: string) => {
  const post = globalPosts.find((p) => p.id === postId);
  if (post) {
    post.text = updatedText;
    post.timeAgo = "Edited just now";
  }
};
