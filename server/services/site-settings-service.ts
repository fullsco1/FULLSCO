import { SiteSettingsRepository } from '../repositories/site-settings-repository.ts';
import { SiteSetting, InsertSiteSetting } from '../../shared/schema';

/**
 * خدمة إعدادات الموقع
 * تحتوي على المنطق التجاري للعمليات المتعلقة بإعدادات الموقع
 */
export class SiteSettingsService {
  private repository: SiteSettingsRepository;

  constructor() {
    this.repository = new SiteSettingsRepository();
  }

  /**
   * الحصول على إعدادات الموقع
   * سيتم إنشاء إعدادات افتراضية إذا لم تكن موجودة
   */
  async getSiteSettings(): Promise<SiteSetting> {
    try {
      // محاولة الحصول على الإعدادات
      let settings = await this.repository.getSiteSettings();
      
      // إذا لم تكن موجودة، نقوم بإنشاء إعدادات افتراضية
      if (!settings) {
        settings = await this.repository.createSiteSettings({});
      }
      
      return settings;
    } catch (error) {
      console.error('Error in SiteSettingsService.getSiteSettings:', error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات الموقع
   * @param data البيانات المراد تحديثها
   */
  async updateSiteSettings(data: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    try {
      // نمر البيانات مباشرة إلى المستودع
      return await this.repository.updateSiteSettings(data);
    } catch (error) {
      console.error('Error in SiteSettingsService.updateSiteSettings:', error);
      throw error;
    }
  }
}