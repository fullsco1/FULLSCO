import { Response } from 'express';

/**
 * دالة مساعدة لبناء استجابة نجاح موحدة
 * @param data البيانات المراد إرجاعها
 * @param message رسالة النجاح (اختيارية)
 * @returns كائن استجابة موحد
 */
export function successResponse<T>(data: T, message: string = 'تمت العملية بنجاح') {
  return {
    success: true,
    message,
    data
  };
}

/**
 * دالة مساعدة للتعامل مع الاستثناءات في المتحكمات
 * @param res كائن الاستجابة
 * @param error كائن الخطأ
 */
export function handleException(res: Response, error: any): void {
  console.error('API Error:', error);
  
  // إرجاع استجابة خطأ مناسبة
  res.status(500).json({
    success: false,
    message: error?.message || 'حدث خطأ أثناء معالجة الطلب',
    error: process.env.NODE_ENV !== 'production' ? error : undefined
  });
}