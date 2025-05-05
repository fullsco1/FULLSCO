import { Express } from 'express';
import authRoutes from './auth-routes';
import usersRoutes from './users-routes';
import siteSettingsRoutes from './site-settings-routes';
import statisticsRoutes from './statistics-routes';
import { loadUser } from '../middlewares/auth-middleware';

/**
 * تسجيل جميع مسارات API
 */
export function registerApiRoutes(app: Express, apiPrefix: string): void {
  // تسجيل وسيط تحميل المستخدم لجميع الطلبات
  app.use(loadUser);

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