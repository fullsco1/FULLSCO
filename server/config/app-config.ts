/**
 * تكوين التطبيق الرئيسي
 */
export const AppConfig = {
  // معلومات التطبيق
  app: {
    name: 'FULLSCO',
    version: '1.0.0',
    description: 'منصة فلسكو للمنح الدراسية',
  },

  // تكوين التحميل والملفات
  upload: {
    path: './uploads',
    maxSize: 10 * 1024 * 1024, // 10 ميجابايت
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },

  // تكوين الجلسة
  session: {
    secret: process.env.SESSION_SECRET || 'fullsco-session-secret',
    expiryInDays: 14,
  },

  // المنافذ وعناوين URL
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    apiPrefix: '/api',
  },

  // تكوين البريد الإلكتروني (إذا أضفنا SendGrid في المستقبل)
  email: {
    from: 'info@fullsco.com',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
  },
};