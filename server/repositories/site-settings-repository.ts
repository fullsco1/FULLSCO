import { db } from '../../db';
import { siteSettings } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { SiteSetting, InsertSiteSetting } from '../../shared/schema';

/**
 * مستودع إعدادات الموقع
 * يتعامل مع عمليات قاعدة البيانات المتعلقة بإعدادات الموقع
 */
export class SiteSettingsRepository {
  /**
   * الحصول على إعدادات الموقع
   * ملاحظة: نفترض وجود سجل واحد فقط في جدول إعدادات الموقع
   */
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    try {
      const [settings] = await db.select().from(siteSettings).limit(1);
      return settings;
    } catch (error) {
      console.error('Error in SiteSettingsRepository.getSiteSettings:', error);
      throw error;
    }
  }

  /**
   * إنشاء إعدادات موقع جديدة
   * @param data بيانات الإعدادات
   */
  async createSiteSettings(data: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    try {
      // نضمن دائماً أن لدينا قيم افتراضية معقولة
      const defaultSettings: Partial<InsertSiteSetting> = {
        siteName: 'FULSCO',
        siteTagline: 'منصة المنح الدراسية',
        siteDescription: 'منصة للمنح الدراسية والفرص التعليمية',
        rtlDirection: true,
        enableDarkMode: false,
        defaultLanguage: 'ar',
        primaryColor: '#3B82F6',
        secondaryColor: '#F59E0B',
        accentColor: '#A855F7',
        footerText: '© ' + new Date().getFullYear() + ' FULSCO - جميع الحقوق محفوظة',
        // القيم البوليانية لإظهار/إخفاء الأقسام
        showHeroSection: true,
        showFeaturedScholarships: true,
        showSearchSection: true,
        showCategoriesSection: true,
        showCountriesSection: true,
        showLatestArticles: true,
        showSuccessStories: true,
        showNewsletterSection: true,
        showStatisticsSection: true,
        showPartnersSection: true,
        enableNewsletter: true,
        enableScholarshipSearch: true,
      };

      // دمج القيم الافتراضية مع البيانات المدخلة
      const settingsData = { ...defaultSettings, ...data };

      const [createdSettings] = await db.insert(siteSettings)
        .values(settingsData)
        .returning();

      return createdSettings;
    } catch (error) {
      console.error('Error in SiteSettingsRepository.createSiteSettings:', error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات الموقع
   * @param data البيانات المراد تحديثها
   */
  async updateSiteSettings(data: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    try {
      // نفترض وجود سجل واحد فقط مع معرف = 1
      const [settings] = await db.select().from(siteSettings).limit(1);
      
      if (!settings) {
        // إذا لم تكن هناك إعدادات، ننشئها
        return await this.createSiteSettings(data);
      }
      
      // تحديث الإعدادات الموجودة
      const [updatedSettings] = await db.update(siteSettings)
        .set(data)
        .where(eq(siteSettings.id, settings.id))
        .returning();
      
      return updatedSettings;
    } catch (error) {
      console.error('Error in SiteSettingsRepository.updateSiteSettings:', error);
      throw error;
    }
  }
}