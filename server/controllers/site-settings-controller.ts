import { Request, Response } from 'express';
import { SiteSettingsService } from '../services/site-settings-service';
import { ZodError } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { siteSettings } from '../../shared/schema';

// إنشاء مخطط التحقق من صحة البيانات باستخدام Zod
const siteSettingsSchema = createInsertSchema(siteSettings);

/**
 * متحكم إعدادات الموقع
 */
export class SiteSettingsController {
  private siteSettingsService: SiteSettingsService;

  constructor() {
    this.siteSettingsService = new SiteSettingsService();
  }

  /**
   * الحصول على إعدادات الموقع
   */
  async getSiteSettings(req: Request, res: Response) {
    try {
      const settings = await this.siteSettingsService.getSiteSettings();
      
      if (!settings) {
        return res.status(404).json({ message: 'لم يتم العثور على إعدادات الموقع' });
      }
      
      return res.json(settings);
    } catch (error) {
      console.error('خطأ في الحصول على إعدادات الموقع:', error);
      return res.status(500).json({ message: 'حدث خطأ في الخادم أثناء الحصول على إعدادات الموقع' });
    }
  }

  /**
   * تحديث إعدادات الموقع
   */
  async updateSiteSettings(req: Request, res: Response) {
    try {
      // التحقق من صحة البيانات المدخلة
      const parsedData = siteSettingsSchema.partial().parse(req.body);
      
      // التحديث
      const updatedSettings = await this.siteSettingsService.updateSiteSettings(parsedData);
      
      return res.json(updatedSettings);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'بيانات غير صالحة', 
          errors: error.errors 
        });
      }
      
      console.error('خطأ في تحديث إعدادات الموقع:', error);
      return res.status(500).json({ message: 'حدث خطأ في الخادم أثناء تحديث إعدادات الموقع' });
    }
  }
}