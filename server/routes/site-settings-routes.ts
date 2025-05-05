import { Router } from 'express';
import { SiteSettingsController } from '../controllers/site-settings-controller';
import { isAdmin, isAuthenticated } from '../middlewares/auth-middleware';

const router = Router();
const controller = new SiteSettingsController();

// الحصول على إعدادات الموقع
router.get('/', (req, res) => controller.getSiteSettings(req, res));

// تحديث إعدادات الموقع (يتطلب صلاحيات المسؤول)
router.put('/', isAdmin, (req, res) => controller.updateSiteSettings(req, res));

// تحديث جزئي لإعدادات الموقع (يتطلب صلاحيات المسؤول)
router.patch('/', isAdmin, (req, res) => controller.updateSiteSettings(req, res));

export default router;