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

// تحديث إعدادات الموقع العامة
router.patch('/general',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    await siteSettingsController.updateGeneralSettings(req, res);
  }
);

// تحديث إعدادات المظهر
router.patch('/appearance',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    await siteSettingsController.updateAppearanceSettings(req, res);
  }
);

// تحديث معلومات الاتصال
router.patch('/contact',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    await siteSettingsController.updateContactSettings(req, res);
  }
);

// تحديث وسائل التواصل الاجتماعي
router.patch('/social',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    await siteSettingsController.updateSocialSettings(req, res);
  }
);

// تحديث إعدادات الصفحة الرئيسية
router.patch('/homepage',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    await siteSettingsController.updateHomepageSettings(req, res);
  }
);

// تحديث عناوين الأقسام
router.patch('/sections',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    await siteSettingsController.updateSectionTitles(req, res);
  }
);

export default router;