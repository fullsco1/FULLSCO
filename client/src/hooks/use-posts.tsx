import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

type PostsContextType = {
  posts: Post[];
  featuredPosts: Post[];
  isLoading: boolean;
  error: Error | null;
};

// شرح: تعريف نوع بيانات معلومات المقالات التي سنوفرها في المزود
export const PostsContext = createContext<PostsContextType | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  // جلب جميع المقالات
  const {
    data: allPosts = [],
    error: postsError,
    isLoading: postsLoading,
  } = useQuery<Post[], Error>({
    queryKey: ["/api/posts"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // فلترة المقالات المميزة
  const featuredPosts = allPosts.filter(post => post.isFeatured);

  return (
    <PostsContext.Provider
      value={{
        posts: allPosts,
        featuredPosts,
        isLoading: postsLoading,
        error: postsError || null,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}