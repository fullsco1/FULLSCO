import { Request, Response } from 'express';
import { SiteSettingsService } from '../services/site-settings-service';
import { insertSiteSettingsSchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper';
import { z } from 'zod';

export class SiteSettingsController {
  private service: SiteSettingsService;

  constructor() {
    this.service = new SiteSettingsService();
  }

  /**
   * الحصول على إعدادات الموقع
   */
  async getSiteSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await this.service.getSiteSettings();
      
      if (!settings) {
        res.status(404).json({
          success: false,
          message: 'لم يتم العثور على إعدادات الموقع'
        });
        return;
      }
      
      res.json(settings);
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * تحديث إعدادات الموقع
   */
  async updateSiteSettings(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات باستخدام Zod
      const validatedData = insertSiteSettingsSchema.partial().parse(req.body);
      
      const settings = await this.service.updateSiteSettings(validatedData);
      
      res.json(successResponse(
        settings,
        'تم تحديث إعدادات الموقع بنجاح'
      ));
    } catch (error) {
      // التعامل مع أخطاء التحقق من صحة البيانات
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'خطأ في بيانات إعدادات الموقع',
          errors: error.errors
        });
        return;
      }
      
      handleException(res, error);
    }
  }
}