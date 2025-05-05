import { Express } from 'express';
import { createServer, Server } from 'http';
import { AppConfig } from '../config/app-config';
import siteSettingsRoutes from './site-settings-routes';
// يمكن إضافة المزيد من ملفات المسارات هنا

/**
 * تسجيل جميع مسارات واجهة برمجة التطبيق (API)
 */
export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  const apiPrefix = AppConfig.server.apiPrefix;
  
  // تسجيل المسارات
  app.use(`${apiPrefix}/site-settings`, siteSettingsRoutes);
  // يمكن إضافة المزيد من المسارات هنا مثل:
  // app.use(`${apiPrefix}/users`, userRoutes);
  // app.use(`${apiPrefix}/scholarships`, scholarshipRoutes);
  // وهكذا...
  
  return server;
}