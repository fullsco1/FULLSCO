import { Request, Response, NextFunction } from 'express';

/**
 * التحقق مما إذا كان المستخدم مسجل الدخول
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح: المستخدم غير مسجل الدخول'
    });
  }
  
  return next();
};

/**
 * التحقق مما إذا كان المستخدم مسؤولاً
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح: المستخدم غير مسجل الدخول'
    });
  }
  
  const user = req.user as any;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح: تحتاج إلى صلاحيات المسؤول للوصول إلى هذا المورد'
    });
  }
  
  return next();
};