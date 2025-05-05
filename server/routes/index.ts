import { Express } from 'express';
import http from 'http';
import { AppConfig } from '../config/app-config';
import siteSettingsRoutes from './site-settings-routes';
import authRoutes from './auth-routes';
import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { AuthService } from '../services/auth-service';

// استيراد مسارات أخرى في المستقبل
// import usersRoutes from './users-routes';
// import postsRoutes from './posts-routes';

/**
 * تسجيل جميع مسارات واجهة برمجة التطبيق
 * @param app تطبيق Express
 * @returns خادم HTTP
 */
export async function registerRoutes(app: Express): Promise<http.Server> {
  const server = http.createServer(app);
  const apiPrefix = AppConfig.server.apiPrefix;
  const authService = new AuthService();

  // إعداد الجلسات
  const MemorySessionStore = MemoryStore(session);
  app.use(
    session({
      secret: AppConfig.server.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 ساعة
      store: new MemorySessionStore({
        checkPeriod: 86400000, // تنظيف الجلسات المنتهية كل 24 ساعة
      }),
    })
  );
  
  // تهيئة Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // تكوين استراتيجية Passport المحلية
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const result = await authService.validateLogin(username, password);
        
        if (!result.success) {
          return done(null, false, { message: result.message });
        }
        
        return done(null, result.user);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  // تسلسل وإلغاء تسلسل الجلسات
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await authService.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // تسجيل المسارات
  app.use(`${apiPrefix}/site-settings`, siteSettingsRoutes);
  app.use(`${apiPrefix}/auth`, authRoutes);
  
  // في المستقبل: إضافة المسارات الأخرى هنا
  // app.use(`${apiPrefix}/users`, usersRoutes);
  // app.use(`${apiPrefix}/posts`, postsRoutes);

  // المسارات المؤقتة من الملف القديم
  // هذه ستتم إزالتها تدريجيًا كلما أضفنا مسارات جديدة
  // اترك هذا الاستدعاء في النهاية ليعمل كملاذ أخير للمسارات
  await registerLegacyRoutes(app);

  return server;
}

/**
 * تسجيل المسارات القديمة من الملف السابق
 * سيتم إزالة هذه الدالة تدريجيًا مع تحديث المسارات
 * ملاحظة: هذه الدالة معطلة مؤقتًا لتجنب دورة الاستيراد
 */
async function registerLegacyRoutes(app: Express): Promise<void> {
  // في المستقبل سنضيف طريقة لتسجيل المسارات القديمة
  // لكن حاليًا نتجنب الاستدعاء الدائري
  console.log('Legacy routes will be imported later to avoid circular dependency');
}