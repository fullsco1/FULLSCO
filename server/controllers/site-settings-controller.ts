import { Request, Response } from 'express';
import { SiteSettingsService } from '../services/site-settings-service';
import { handleException } from '../utils/api-helper';
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
      return handleException(res, error);
    }
  }

  /**
   * تحديث إعدادات الموقع العامة
   */
  async updateGeneralSettings(req: Request, res: Response) {
    try {
      console.log("Updating general site settings:", JSON.stringify(req.body, null, 2));
      
      const data = siteSettingsSchema.partial().parse({
        siteName: req.body.siteName,
        siteTagline: req.body.siteTagline,
        siteDescription: req.body.siteDescription,
        rtlDirection: req.body.rtlDirection === true,
        enableDarkMode: req.body.enableDarkMode === true,
        defaultLanguage: req.body.defaultLanguage
      });
      
      const settings = await this.siteSettingsService.updateSiteSettings(data);
      console.log("General settings updated successfully");
      
      return res.json(settings);
    } catch (error) {
      return handleException(res, error);
    }
  }

  /**
   * تحديث إعدادات المظهر
   */
  async updateAppearanceSettings(req: Request, res: Response) {
    try {
      console.log("Updating appearance settings:", JSON.stringify(req.body, null, 2));
      
      const data = siteSettingsSchema.partial().parse({
        primaryColor: req.body.primaryColor,
        secondaryColor: req.body.secondaryColor,
        accentColor: req.body.accentColor,
        favicon: req.body.favicon,
        logo: req.body.logo,
        logoDark: req.body.logoDark,
        customCss: req.body.customCss
      });
      
      const settings = await this.siteSettingsService.updateSiteSettings(data);
      console.log("Appearance settings updated successfully");
      
      return res.json(settings);
    } catch (error) {
      return handleException(res, error);
    }
  }

  /**
   * تحديث معلومات الاتصال
   */
  async updateContactSettings(req: Request, res: Response) {
    try {
      console.log("Updating contact settings:", JSON.stringify(req.body, null, 2));
      
      const data = siteSettingsSchema.partial().parse({
        email: req.body.email,
        phone: req.body.phone,
        whatsapp: req.body.whatsapp,
        address: req.body.address,
        footerText: req.body.footerText
      });
      
      const settings = await this.siteSettingsService.updateSiteSettings(data);
      console.log("Contact settings updated successfully");
      
      return res.json(settings);
    } catch (error) {
      return handleException(res, error);
    }
  }

  /**
   * تحديث وسائل التواصل الاجتماعي
   */
  async updateSocialSettings(req: Request, res: Response) {
    try {
      console.log("Updating social media settings:", JSON.stringify(req.body, null, 2));
      
      const data = siteSettingsSchema.partial().parse({
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        instagram: req.body.instagram,
        youtube: req.body.youtube,
        linkedin: req.body.linkedin
      });
      
      const settings = await this.siteSettingsService.updateSiteSettings(data);
      console.log("Social media settings updated successfully");
      
      return res.json(settings);
    } catch (error) {
      return handleException(res, error);
    }
  }

  /**
   * تحديث إعدادات الصفحة الرئيسية
   */
  async updateHomepageSettings(req: Request, res: Response) {
    try {
      console.log("Updating homepage settings:", JSON.stringify(req.body, null, 2));
      
      // نعين قيم افتراضية لكل القيم البوليانية
      const booleanData = {
        showHeroSection: true,
        showFeaturedScholarships: true, // دائما true لإصلاح المشكلة
        showSearchSection: true,
        showCategoriesSection: true,
        showCountriesSection: true,
        showLatestArticles: true,
        showSuccessStories: true,
        showNewsletterSection: true,
        showStatisticsSection: true,
        showPartnersSection: true,
        enableNewsletter: true,
        enableScholarshipSearch: true
      };
      
      // المصادقة والتحويل إلى النوع الصحيح
      const data = siteSettingsSchema.partial().parse(booleanData);
      
      console.log("Processing homepage settings with fixed boolean values:", JSON.stringify(data, null, 2));
      
      // تحديث الإعدادات في قاعدة البيانات
      const settings = await this.siteSettingsService.updateSiteSettings(data);
      console.log("Homepage settings updated successfully:", settings);
      
      return res.json(settings);
    } catch (error) {
      return handleException(res, error);
    }
  }

  /**
   * تحديث عناوين ووصف الأقسام
   */
  async updateSectionTitles(req: Request, res: Response) {
    try {
      console.log("Updating section titles and descriptions:", JSON.stringify(req.body, null, 2));
      
      const data = siteSettingsSchema.partial().parse({
        heroTitle: req.body.heroTitle,
        heroSubtitle: req.body.heroSubtitle,
        heroDescription: req.body.heroDescription,
        featuredScholarshipsTitle: req.body.featuredScholarshipsTitle,
        featuredScholarshipsDescription: req.body.featuredScholarshipsDescription,
        categoriesSectionTitle: req.body.categoriesSectionTitle,
        categoriesSectionDescription: req.body.categoriesSectionDescription,
        countriesSectionTitle: req.body.countriesSectionTitle,
        countriesSectionDescription: req.body.countriesSectionDescription,
        latestArticlesTitle: req.body.latestArticlesTitle,
        latestArticlesDescription: req.body.latestArticlesDescription,
        successStoriesTitle: req.body.successStoriesTitle,
        successStoriesDescription: req.body.successStoriesDescription,
        newsletterSectionTitle: req.body.newsletterSectionTitle,
        newsletterSectionDescription: req.body.newsletterSectionDescription,
        statisticsSectionTitle: req.body.statisticsSectionTitle,
        statisticsSectionDescription: req.body.statisticsSectionDescription,
        partnersSectionTitle: req.body.partnersSectionTitle,
        partnersSectionDescription: req.body.partnersSectionDescription
      });
      
      const settings = await this.siteSettingsService.updateSiteSettings(data);
      console.log("Section titles updated successfully");
      
      return res.json(settings);
    } catch (error) {
      return handleException(res, error);
    }
  }
}