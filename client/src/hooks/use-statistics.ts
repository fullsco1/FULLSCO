import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Statistic } from "@shared/schema";

export function useStatistics() {
  const { 
    data: statistics = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<Statistic[]>({
    queryKey: ['/api/statistics'],
    queryFn: () => apiRequest('/api/statistics?active=true'),
  });
  
  return {
    statistics,
    isLoading,
    isError,
    error
  };
}