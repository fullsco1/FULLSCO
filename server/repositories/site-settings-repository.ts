import { db } from "../../db";
import { siteSettings, InsertSiteSetting, SiteSetting } from "../../shared/schema";
import { eq } from "drizzle-orm";

export class SiteSettingsRepository {
  /**
   * الحصول على إعدادات الموقع
   */
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    try {
      // عادة ما يكون هناك سجل واحد فقط لإعدادات الموقع
      const result = await db.query.siteSettings.findFirst();
      return result;
    } catch (error) {
      console.error("Error in getSiteSettings:", error);
      throw error;
    }
  }

  /**
   * إنشاء إعدادات الموقع
   */
  async createSiteSettings(settingsData: InsertSiteSetting): Promise<SiteSetting> {
    try {
      const [result] = await db.insert(siteSettings)
        .values(settingsData)
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error in createSiteSettings:", error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات الموقع
   */
  async updateSiteSettings(settingsData: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    try {
      // نفترض أن هناك سجل واحد فقط لإعدادات الموقع
      const settings = await this.getSiteSettings();
      
      if (!settings) {
        throw new Error("إعدادات الموقع غير موجودة");
      }
      
      const [result] = await db.update(siteSettings)
        .set(settingsData)
        .where(eq(siteSettings.id, settings.id))
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error in updateSiteSettings:", error);
      throw error;
    }
  }
}