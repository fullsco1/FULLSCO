import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Partner {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function usePartners() {
  const { 
    data: partners = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners');
      return response.json() as Promise<Partner[]>;
    },
  });

  return {
    partners,
    isLoading,
    isError,
    error,
    refetch
  };
}

export function useActivePartners() {
  const { partners, isLoading, isError, error, refetch } = usePartners();
  
  const activePartners = partners.filter(partner => partner.isActive);
  
  return {
    partners: activePartners,
    isLoading,
    isError,
    error,
    refetch
  };
}