import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      email: string;
      isAdmin: boolean;
    };
  }
}

/**
 * التحقق من أن المستخدم قام بتسجيل الدخول
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    message: 'غير مصرح به، يرجى تسجيل الدخول'
  });
}

/**
 * التحقق من أن المستخدم مسؤول
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.user?.isAdmin) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'غير مصرح به، هذه العملية تتطلب صلاحيات المسؤول'
  });
}