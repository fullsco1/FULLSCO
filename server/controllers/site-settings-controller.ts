import { Request, Response } from 'express';
import { SiteSettingsService } from '../services/site-settings-service';
import { handleException, successResponse } from '../utils/api-helper';
import { z } from 'zod';

/**
 * وحدة تحكم إعدادات الموقع
 * تتعامل مع طلبات HTTP المتعلقة بإعدادات الموقع
 */
export class SiteSettingsController {
  private service: SiteSettingsService;

  constructor() {
    this.service = new SiteSettingsService();
  }

  /**
   * الحصول على إعدادات الموقع
   */
  async getSiteSettings(req: Request, res: Response): Promise<Response> {
    try {
      const settings = await this.service.getSiteSettings();
      return res.json(settings);
    } catch (error) {
      return handleException(res, error);
    }
  }

  /**
   * تحديث إعدادات الموقع
   */
  async updateSiteSettings(req: Request, res: Response): Promise<Response> {
    try {
      // تأكد من وجود المستخدم المصادق وأنه مسؤول
      if (!req.isAuthenticated || !req.isAuthenticated() || (req.user as any)?.role !== 'admin') {
        return res.status(403).json({
          message: 'غير مصرح: تحتاج إلى صلاحيات المسؤول للوصول إلى هذا المورد'
        });
      }

      // تحقق من البيانات المرسلة
      // ملاحظة: يمكن تفصيل التحقق حسب الحاجة في المستقبل
      const schema = z.object({
        // السماح بتحديث جميع حقول إعدادات الموقع
        // (جميع الحقول اختيارية)
        siteName: z.string().optional(),
        siteTagline: z.string().optional(),
        siteDescription: z.string().optional(),
        favicon: z.string().nullable().optional(),
        logo: z.string().nullable().optional(),
        logoDark: z.string().nullable().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().nullable().optional(),
        address: z.string().optional(),
        facebook: z.string().optional(),
        twitter: z.string().optional(),
        instagram: z.string().optional(),
        youtube: z.string().optional(),
        linkedin: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        enableDarkMode: z.boolean().optional(),
        rtlDirection: z.boolean().optional(),
        defaultLanguage: z.string().optional(),
        enableNewsletter: z.boolean().optional(),
        enableScholarshipSearch: z.boolean().optional(),
        footerText: z.string().optional(),
        showHeroSection: z.boolean().optional(),
        showFeaturedScholarships: z.boolean().optional(),
        showSearchSection: z.boolean().optional(),
        showCategoriesSection: z.boolean().optional(),
        showCountriesSection: z.boolean().optional(),
        showLatestArticles: z.boolean().optional(),
        showSuccessStories: z.boolean().optional(),
        showNewsletterSection: z.boolean().optional(),
        showStatisticsSection: z.boolean().optional(),
        showPartnersSection: z.boolean().optional(),
        heroTitle: z.string().optional(),
        heroDescription: z.string().optional(),
        heroButtonText: z.string().optional(),
        customCss: z.string().nullable().optional()
      });

      // تحقق من البيانات
      const validatedData = schema.parse(req.body);
      
      // تحديث الإعدادات
      const updatedSettings = await this.service.updateSiteSettings(validatedData);
      
      return res.json(successResponse(updatedSettings, 'تم تحديث إعدادات الموقع بنجاح'));
    } catch (error) {
      return handleException(res, error);
    }
  }
}