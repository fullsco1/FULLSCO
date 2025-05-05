import { Express } from 'express';
import authRoutes from './auth-routes';
import usersRoutes from './users-routes';
import siteSettingsRoutes from './site-settings-routes';
import statisticsRoutes from './statistics-routes';

/**
 * تسجيل جميع مسارات API
 */
export function registerApiRoutes(app: Express, apiPrefix: string): void {
  // تسجيل مسارات المصادقة
  app.use(`${apiPrefix}/auth`, authRoutes);

  // تسجيل مسارات المستخدمين
  app.use(`${apiPrefix}/users`, usersRoutes);

  // تسجيل مسارات إعدادات الموقع
  app.use(`${apiPrefix}/site-settings`, siteSettingsRoutes);

  // تسجيل مسارات الإحصائيات
  app.use(`${apiPrefix}/statistics`, statisticsRoutes);

  // يمكن إضافة المزيد من المسارات هنا
}