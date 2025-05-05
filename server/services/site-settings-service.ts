import { SiteSettingsRepository } from '../repositories/site-settings-repository';
import { InsertSiteSetting, SiteSetting } from '../../shared/schema';

export class SiteSettingsService {
  private repository: SiteSettingsRepository;

  constructor() {
    this.repository = new SiteSettingsRepository();
  }

  /**
   * الحصول على إعدادات الموقع
   */
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    return this.repository.getSiteSettings();
  }

  /**
   * تحديث إعدادات الموقع
   */
  async updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    const existingSettings = await this.repository.getSiteSettings();
    
    if (!existingSettings) {
      return this.repository.createSiteSettings(settings as InsertSiteSetting);
    }
    
    return this.repository.updateSiteSettings(settings);
  }
}