import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Statistic } from "@shared/schema";

export interface StatisticData {
  id: number;
  title: string;
  value: string;
  description?: string;
  icon: string;
  color?: string;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useStatistics() {
  const { 
    data: statistics = [], 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery<StatisticData[]>({
    queryKey: ['/api/statistics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/statistics?active=true');
      return response.json();
    },
  });
  
  return {
    statistics,
    isLoading,
    isError,
    error,
    refetch
  };
}