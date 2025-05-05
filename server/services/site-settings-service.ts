import { db } from "../db";
import { siteSettings } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { SiteSetting, InsertSiteSetting } from "../../shared/schema";

/**
 * خدمة إدارة إعدادات الموقع
 */
export class SiteSettingsService {
  /**
   * الحصول على إعدادات الموقع
   */
  async getSiteSettings(): Promise<SiteSetting | undefined> {
    const result = await db.select()
      .from(siteSettings)
      .limit(1);
    
    return result[0];
  }

  /**
   * تحديث إعدادات الموقع
   */
  async updateSiteSettings(data: Partial<InsertSiteSetting>): Promise<SiteSetting> {
    // التحقق أولاً إذا كان هناك إعدادات موجودة
    const existingSettings = await this.getSiteSettings();
    
    if (existingSettings) {
      // إذا كان هناك إعدادات، قم بتحديثها
      const [updated] = await db.update(siteSettings)
        .set(data)
        .where(eq(siteSettings.id, existingSettings.id))
        .returning();
      
      return updated;
    } else {
      // إذا لم تكن هناك إعدادات، أنشئ إعدادات جديدة
      const [created] = await db.insert(siteSettings)
        .values({
          siteName: "FULLSCO", // القيمة الافتراضية
          siteTagline: "منصة فلسكو للمنح الدراسية",
          ...data,
        })
        .returning();
      
      return created;
    }
  }
}