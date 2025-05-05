import express from 'express';
import { SiteSettingsController } from '../controllers/site-settings-controller';
import { isAdmin } from '../middlewares/auth-middleware';

// إنشاء موجه Express
const router = express.Router();
const controller = new SiteSettingsController();

/**
 * الحصول على إعدادات الموقع
 * GET /api/site-settings
 */
router.get('/', (req, res) => controller.getSiteSettings(req, res));

/**
 * تحديث إعدادات الموقع (يتطلب صلاحيات المسؤول)
 * PATCH /api/site-settings
 */
router.patch('/', isAdmin, (req, res) => controller.updateSiteSettings(req, res));

export default router;