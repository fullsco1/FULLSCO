import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users-service';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const usersService = new UsersService();

/**
 * التحقق من أن المستخدم قام بتسجيل الدخول
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    // إضافة معلومات المستخدم إلى الطلب لاستخدامها في المراقبات إذا لزم الأمر
    usersService.getUserById(req.session.userId).then(user => {
      if (user) {
        req.user = user;
        return next();
      } else {
        // إزالة معرف المستخدم من الجلسة إذا لم يتم العثور على المستخدم
        delete req.session!.userId;
        delete req.session!.isAdmin;
        
        return res.status(401).json({
          success: false,
          message: 'غير مصرح به، يرجى تسجيل الدخول'
        });
      }
    }).catch(error => {
      console.error('خطأ أثناء التحقق من المستخدم:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء التحقق من صحة المستخدم'
      });
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح به، يرجى تسجيل الدخول'
    });
  }
}

/**
 * التحقق من أن المستخدم مسؤول
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId && req.session?.isAdmin) {
    // إضافة معلومات المستخدم إلى الطلب لاستخدامها في المراقبات إذا لزم الأمر
    usersService.getUserById(req.session.userId).then(user => {
      if (user && usersService.isAdmin(user)) {
        req.user = user;
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح به، هذه العملية تتطلب صلاحيات المسؤول'
        });
      }
    }).catch(error => {
      console.error('خطأ أثناء التحقق من المستخدم:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء التحقق من صحة المستخدم'
      });
    });
  } else {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح به، هذه العملية تتطلب صلاحيات المسؤول'
    });
  }
}