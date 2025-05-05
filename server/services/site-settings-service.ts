import { SiteSettingsRepository } from '../repositories/site-settings-repository';
import { SiteSetting, InsertSiteSetting } from '../../shared/schema';

/**
 * خدمة إعدادات الموقع
 * تحتوي على منطق الأعمال لإدارة إعدادات الموقع
 */
export class SiteSettingsService {
  private repository: SiteSettingsRepository;

  constructor() {
    this.repository = new SiteSettingsRepository();
  }

  /**
   * الحصول على إعدادات الموقع
   */
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    return await this.repository.getSiteSettings();
  }

  /**
   * تحديث إعدادات الموقع
   * @param data البيانات المراد تحديثها
   */
  async updateSiteSettings(data: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    try {
      // الحصول على الإعدادات الحالية أولاً
      const currentSettings = await this.repository.getSiteSettings();
      
      // إذا كانت الإعدادات موجودة، نقوم بالتحديث
      if (currentSettings) {
        return await this.repository.updateSiteSettings(data);
      } 
      // إذا لم تكن موجودة، ننشئ إعدادات جديدة
      else {
        return await this.repository.createSiteSettings(data);
      }
    } catch (error) {
      console.error('Error in SiteSettingsService.updateSiteSettings:', error);
      throw error;
    }
  }
}