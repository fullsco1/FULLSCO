import { Router } from 'express';
import { SiteSettingsController } from '../controllers/site-settings-controller';
import { isAdmin, isAuthenticated } from '../middlewares/auth-middleware';

const router = Router();
const siteSettingsController = new SiteSettingsController();

/**
 * مسارات إعدادات الموقع
 */

// الحصول على إعدادات الموقع (متاح للجميع)
router.get('/', async (req, res) => {
  await siteSettingsController.getSiteSettings(req, res);
});

// تحديث إعدادات الموقع (للمسؤولين فقط)
router.put('/',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    await siteSettingsController.updateSiteSettings(req, res);
  }
);

export default router;