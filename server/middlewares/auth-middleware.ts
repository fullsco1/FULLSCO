import { Request, Response, NextFunction } from 'express';

/**
 * وسيط للتحقق من أن المستخدم قام بتسجيل الدخول
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'غير مصرح: الرجاء تسجيل الدخول'
  });
}

/**
 * وسيط للتحقق من أن المستخدم لديه صلاحيات المسؤول
 * يجب استخدامه بعد وسيط isAuthenticated
 */
export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  // التأكد من أن المستخدم مسجل الدخول أولاً
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح: الرجاء تسجيل الدخول'
    });
  }
  
  // التحقق من صلاحيات المسؤول
  const user = req.user as any;
  if (user && user.role === 'admin') {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'الوصول مرفوض: مطلوب صلاحيات المسؤول'
  });
}

/**
 * وسيط للتحقق من أن المستخدم هو نفسه أو مسؤول
 * مفيد لعمليات تعديل بيانات المستخدمين
 */
export function isSelfOrAdmin(req: Request, res: Response, next: NextFunction): void {
  // التأكد من أن المستخدم مسجل الدخول أولاً
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح: الرجاء تسجيل الدخول'
    });
  }
  
  const user = req.user as any;
  const requestedUserId = parseInt(req.params.id);
  
  // السماح إذا كان المستخدم هو نفسه أو مسؤول
  if (
    (user && user.id === requestedUserId) || 
    (user && user.role === 'admin')
  ) {
    return next();
  }
  
  res.status(403).json({
    success: false,
    message: 'الوصول مرفوض: يمكنك فقط تعديل بياناتك الشخصية'
  });
}