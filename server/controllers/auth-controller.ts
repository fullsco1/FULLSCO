import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth-service';
import { handleException } from '../utils/api-helper';
import passport from 'passport';
import { z } from 'zod';
import { User } from '../../shared/schema';

/**
 * وحدة تحكم المصادقة
 * تتعامل مع طلبات المصادقة وتسجيل الدخول والخروج
 */
export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  /**
   * معالجة طلب تسجيل الدخول
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // تحقق من بيانات الطلب باستخدام Zod
      const schema = z.object({
        username: z.string().min(1, 'اسم المستخدم مطلوب'),
        password: z.string().min(1, 'كلمة المرور مطلوبة')
      });
      
      const validatedData = schema.parse(req.body);
      
      passport.authenticate('local', (err: Error, user: User, info: any) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            message: info.message || 'فشل تسجيل الدخول' 
          });
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          
          // إزالة كلمة المرور من الاستجابة
          const sanitizedUser = this.service.sanitizeUser(user);
          
          return res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: sanitizedUser
          });
        });
      })(req, res, next);
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * معالجة طلب تسجيل الخروج
   */
  async logout(req: Request, res: Response): Promise<Response> {
    try {
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ أثناء تسجيل الخروج' 
          });
        }
        
        return res.json({
          success: true,
          message: 'تم تسجيل الخروج بنجاح'
        });
      });
      
      // ضروري لإرضاء TypeScript، الإستجابة تتم داخل الدالة req.logout()
      return res;
    } catch (error) {
      return handleException(res, error);
    }
  }

  /**
   * معالجة طلب الحصول على معلومات المستخدم الحالي
   */
  async getCurrentUser(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          message: 'غير مصرح: المستخدم غير مسجل الدخول'
        });
      }
      
      const user = req.user as User;
      const sanitizedUser = this.service.sanitizeUser(user);
      
      return res.json({
        success: true,
        user: sanitizedUser
      });
    } catch (error) {
      return handleException(res, error);
    }
  }
}