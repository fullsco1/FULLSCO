import { Request, Response, NextFunction } from 'express';

/**
 * وسيط للتحقق من حالة تسجيل الدخول
 * يتحقق مما إذا كان المستخدم مسجل دخوله
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ 
    message: 'غير مصرح: يجب تسجيل الدخول للوصول إلى هذا المورد' 
  });
}

/**
 * وسيط للتحقق من أن المستخدم مسؤول
 * يتحقق مما إذا كان المستخدم المصادق لديه صلاحيات المسؤول
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // التحقق من وجود المستخدم
  if (!req.user) {
    return res.status(401).json({ 
      message: 'غير مصرح: يجب تسجيل الدخول للوصول إلى هذا المورد' 
    });
  }
  
  // التحقق من صلاحيات المسؤول
  // نفترض أن كائن المستخدم يحتوي على خاصية isAdmin
  const user = req.user as any;
  if (user.role === 'admin' || user.isAdmin === true) {
    return next();
  }
  
  return res.status(403).json({ 
    message: 'ممنوع: صلاحيات المسؤول مطلوبة'
  });
}

/**
 * وسيط للمساعدة في تصحيح أخطاء المصادقة أثناء التطوير
 * يسمح بتخطي المصادقة في بيئة التطوير فقط
 */
export function devBypassAuth(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    // في وضع التطوير، نقوم بتعيين المستخدم كمسؤول
    (req as any).user = {
      id: 1,
      username: 'admin',
      role: 'admin',
      isAdmin: true
    };
    
    // نقوم بتعريف دالة isAuthenticated إذا لم تكن موجودة
    if (!req.isAuthenticated) {
      req.isAuthenticated = () => true;
    }
    
    return next();
  }
  
  // في الإنتاج، نقوم بتمرير الطلب كما هو
  return next();
}