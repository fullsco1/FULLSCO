import { Response } from 'express';
import { ZodError } from 'zod';

/**
 * وظائف مساعدة للتعامل مع واجهة برمجة التطبيق (API)
 */

/**
 * إرسال استجابة نجاح مع بيانات
 */
export function sendSuccess(res: Response, data: any = null, message: string = 'نجاح', statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * إرسال استجابة خطأ
 */
export function sendError(res: Response, message: string = 'حدث خطأ', statusCode: number = 400, errors: any = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

/**
 * معالجة أخطاء Zod
 */
export function handleZodError(res: Response, error: ZodError) {
  const formattedErrors = error.errors.reduce((acc, err) => {
    const path = err.path.join('.');
    acc[path] = err.message;
    return acc;
  }, {} as Record<string, string>);
  
  return sendError(res, 'بيانات غير صالحة', 400, formattedErrors);
}

/**
 * معالجة الاستثناءات بشكل عام
 */
export function handleException(res: Response, error: any) {
  console.error('خطأ في الخادم:', error);
  
  if (error instanceof ZodError) {
    return handleZodError(res, error);
  }
  
  return sendError(res, 'حدث خطأ في الخادم', 500);
}