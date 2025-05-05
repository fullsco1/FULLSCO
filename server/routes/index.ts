import { Express } from 'express';
import { createServer, Server } from 'http';
import statisticsRoutes from './statistics-routes.ts';
import partnersRoutes from './partners-routes.ts';
import scholarshipsRoutes from './scholarships-routes.ts';
import postsRoutes from './posts-routes.ts';
import successStoriesRoutes from './success-stories-routes.ts';
// Importa aquí otras rutas a medida que las vayas creando

/**
 * تسجيل جميع مسارات API
 * @param app تطبيق Express
 * @param apiPrefix بادئة API (e.g., /api)
 * @returns خادم HTTP
 */
export function registerRoutes(app: Express, apiPrefix: string = '/api'): Server {
  // تسجيل مسارات الإحصاءات
  app.use(`${apiPrefix}/statistics`, statisticsRoutes);
  
  // تسجيل مسارات الشركاء
  app.use(`${apiPrefix}/partners`, partnersRoutes);
  
  // تسجيل مسارات المنح الدراسية
  app.use(`${apiPrefix}/scholarships`, scholarshipsRoutes);
  
  // تسجيل مسارات المقالات
  app.use(`${apiPrefix}/posts`, postsRoutes);
  
  // تسجيل مسارات قصص النجاح
  app.use(`${apiPrefix}/success-stories`, successStoriesRoutes);
  
  // يمكنك إضافة المزيد من المسارات هنا عند إنشائها
  
  // لا نحتاج إلى استدعاء المسارات القديمة هنا، 
  // سيتم ذلك من خلال registerRoutes في routes.ts
  
  // إنشاء وإرجاع خادم HTTP
  const httpServer = createServer(app);
  return httpServer;
}