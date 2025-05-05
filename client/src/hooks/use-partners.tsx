import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Partner } from "@shared/schema";

export interface PartnerData {
  id: number;
  name: string;
  logoUrl?: string;
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
  } = useQuery<PartnerData[]>({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners');
      return response.json();
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

// هذه الوظيفة تستخدم للواجهة الأمامية، تجلب فقط الشركاء النشطين
export function useActivePartners() {
  const { 
    data: partners = [], 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery<PartnerData[]>({
    queryKey: ['/api/partners', 'active'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners?active=true');
      return response.json();
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