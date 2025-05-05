import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth-service';

// توسيع نوع الطلب لإضافة معلومات المستخدم
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * وسيط للتحقق مما إذا كان المستخدم مصادق عليه
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.userId) {
    res.status(401).json({
      success: false,
      message: 'غير مصرح به'
    });
    return;
  }

  next();
}

/**
 * وسيط للتحقق مما إذا كان المستخدم مسؤولاً
 */
export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.isAdmin) {
    res.status(403).json({
      success: false,
      message: 'غير مصرح به، هذه العملية تتطلب صلاحيات المسؤول'
    });
    return;
  }

  next();
}

/**
 * وسيط لتحميل معلومات المستخدم الحالي
 */
export async function loadUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  // التحقق مما إذا كان هناك معرف مستخدم في الجلسة
  if (req.session?.userId) {
    try {
      const authService = new AuthService();
      const user = await authService.getUserById(req.session.userId);
      
      if (user) {
        // حذف كلمة المرور من المستخدم
        const { password, ...userWithoutPassword } = user;
        
        // تخزين معلومات المستخدم في الطلب
        req.user = userWithoutPassword;
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
  
  next();
}