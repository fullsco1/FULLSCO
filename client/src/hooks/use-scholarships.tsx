import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Scholarship } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

type ScholarshipsContextType = {
  scholarships: Scholarship[];
  featuredScholarships: Scholarship[];
  isLoading: boolean;
  error: Error | null;
};

export const ScholarshipsContext = createContext<ScholarshipsContextType | null>(null);

export function ScholarshipsProvider({ children }: { children: ReactNode }) {
  const {
    data: scholarships = [],
    error: scholarshipsError,
    isLoading: scholarshipsLoading,
  } = useQuery<Scholarship[], Error>({
    queryKey: ["/api/scholarships"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const {
    data: featuredScholarships = [],
    error: featuredError,
    isLoading: featuredLoading,
  } = useQuery<Scholarship[], Error>({
    queryKey: ["/api/scholarships/featured"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Combine errors
  const error = scholarshipsError || featuredError;
  const isLoading = scholarshipsLoading || featuredLoading;

  return (
    <ScholarshipsContext.Provider
      value={{
        scholarships,
        featuredScholarships,
        isLoading,
        error: error || null,
      }}
    >
      {children}
    </ScholarshipsContext.Provider>
  );
}

export function useScholarships() {
  const context = useContext(ScholarshipsContext);
  if (!context) {
    throw new Error("useScholarships must be used within a ScholarshipsProvider");
  }
  return context;
}