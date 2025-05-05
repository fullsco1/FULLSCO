import { Request, Response, NextFunction } from 'express';

/**
 * وسيط للتحقق من المصادقة
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'غير مصرح، يرجى تسجيل الدخول' });
  }
  
  next();
};

/**
 * وسيط للتحقق من صلاحيات المسؤول
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // نتحقق أولاً أن المستخدم قد قام بتسجيل الدخول
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'غير مصرح، يرجى تسجيل الدخول' });
  }
  
  // نتحقق من صلاحيات المسؤول
  const user = req.user as any;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'محظور: صلاحيات المسؤول مطلوبة' });
  }
  
  next();
};