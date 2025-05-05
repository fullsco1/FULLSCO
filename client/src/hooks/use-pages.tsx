import { useQuery } from '@tanstack/react-query';

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  showInFooter: boolean;
  showInHeader: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsePagesOptions {
  showInHeader?: boolean;
  showInFooter?: boolean;
  enabled?: boolean;
}

export function usePages(options: UsePagesOptions = {}) {
  const { showInHeader, showInFooter, enabled = true } = options;
  
  // بناء عنوان URL مع معلمات الإستعلام
  let apiUrl = '/api/pages';
  const params = new URLSearchParams();
  
  if (showInHeader !== undefined) {
    params.append('header', showInHeader.toString());
  }
  
  if (showInFooter !== undefined) {
    params.append('footer', showInFooter.toString());
  }
  
  const queryString = params.toString();
  if (queryString) {
    apiUrl += `?${queryString}`;
  }
  
  return useQuery<Page[]>({
    queryKey: [apiUrl],
    queryFn: async () => {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في جلب الصفحات');
      }
      
      return response.json();
    },
    enabled
  });
}

export function usePage(slug: string, enabled = true) {
  return useQuery<Page>({
    queryKey: [`/api/pages/slug/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/pages/slug/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('الصفحة غير موجودة');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في جلب الصفحة');
      }
      
      return response.json();
    },
    enabled: enabled && !!slug
  });
}

// جلب الصفحة بواسطة المعرف (ID)
export function usePageById(id: number | string | null | undefined, enabled = true) {
  const pageId = id ? Number(id) : null;
  
  return useQuery<Page>({
    queryKey: [`/api/pages/${pageId}`],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${pageId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('الصفحة غير موجودة');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'فشل في جلب الصفحة');
      }
      
      return response.json();
    },
    enabled: enabled && pageId !== null && !isNaN(pageId)
  });
}