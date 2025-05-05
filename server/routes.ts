import express, { type Express, type Request, type Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-fixed";
import { 
  insertUserSchema, 
  insertScholarshipSchema,
  insertPostSchema,
  insertCategorySchema,
  insertLevelSchema,
  insertCountrySchema,
  insertTagSchema,
  insertSuccessStorySchema,
  insertSubscriberSchema,
  insertSeoSettingsSchema,
  insertSiteSettingsSchema,
  insertPageSchema,
  insertMenuSchema,
  insertMenuItemSchema,
  insertMediaFileSchema,
  insertStatisticSchema,
  insertPartnerSchema,
  User,
  menuLocationEnum
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";
import sizeOf from "image-size";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // Set up multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
      // تحقق من أن الملف صورة صالحة
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('الملف المرفوع ليس صورة!') as any, false);
      }
    }
  });

  // Set up authentication
  const MemorySessionStore = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fullsco-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
      store: new MemorySessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden: Admin access required" });
  };

  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Remove password from response
        const userResponse = { ...user };
        delete userResponse.password;
        
        return res.json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Remove password from response
    const userResponse = { ...req.user as any };
    delete userResponse.password;
    
    res.json(userResponse);
  });

  // User routes
  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/users", isAdmin, async (req, res) => {
    const users = await storage.listUsers();
    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(safeUsers);
  });

  // Category routes
  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/categories", async (req, res) => {
    const categories = await storage.listCategories();
    res.json(categories);
  });

  app.get("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    const category = await storage.getCategory(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  });

  app.put("/api/categories/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    try {
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, data);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/categories/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    const success = await storage.deleteCategory(id);
    if (!success) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  });

  // Level routes
  app.post("/api/levels", isAdmin, async (req, res) => {
    try {
      const data = insertLevelSchema.parse(req.body);
      const level = await storage.createLevel(data);
      res.status(201).json(level);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/levels", async (req, res) => {
    const levels = await storage.listLevels();
    res.json(levels);
  });

  // Country routes
  app.post("/api/countries", isAdmin, async (req, res) => {
    try {
      const data = insertCountrySchema.parse(req.body);
      const country = await storage.createCountry(data);
      res.status(201).json(country);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/countries", async (req, res) => {
    const countries = await storage.listCountries();
    res.json(countries);
  });

  // Scholarship routes
  app.post("/api/scholarships", isAdmin, async (req, res) => {
    try {
      // معالجة التواريخ قبل التحقق من صحة البيانات
      const processedBody = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };
      
      const data = insertScholarshipSchema.parse(processedBody);
      const scholarship = await storage.createScholarship(data);
      res.status(201).json(scholarship);
    } catch (error) {
      console.error("Error creating scholarship:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/scholarships", async (req, res) => {
    const { featured, country, level, category } = req.query;
    const filters: any = {};
    
    if (featured !== undefined) {
      filters.isFeatured = featured === "true";
    }
    
    if (country) {
      const countryId = parseInt(country as string);
      if (!isNaN(countryId)) {
        filters.countryId = countryId;
      }
    }
    
    if (level) {
      const levelId = parseInt(level as string);
      if (!isNaN(levelId)) {
        filters.levelId = levelId;
      }
    }
    
    if (category) {
      const categoryId = parseInt(category as string);
      if (!isNaN(categoryId)) {
        filters.categoryId = categoryId;
      }
    }
    
    const scholarships = await storage.listScholarships(Object.keys(filters).length > 0 ? filters : undefined);
    res.json(scholarships);
  });

  // مسار الحصول على المنح المميزة
  app.get("/api/scholarships/featured", async (req, res) => {
    try {
      const scholarships = await storage.listScholarships({ isFeatured: true });
      res.json(scholarships);
    } catch (error) {
      console.error("Error fetching featured scholarships:", error);
      res.status(500).json({ message: "Failed to fetch featured scholarships", error: (error as Error).message });
    }
  });

  // مسار الحصول على المنحة بواسطة الـ slug
  app.get("/api/scholarships/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const scholarship = await storage.getScholarshipBySlug(slug);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      res.json(scholarship);
    } catch (error) {
      console.error("Error fetching scholarship by slug:", error);
      res.status(500).json({ message: "Failed to fetch scholarship", error: (error as Error).message });
    }
  });
  
  // مسار الحصول على المنحة بواسطة المعرف (ID)
  // هذا المسار يجب أن يكون بعد المسارات المحددة مثل /featured و /slug
  app.get("/api/scholarships/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid scholarship ID" });
      }
      console.log(`Fetching scholarship with ID: ${id}`);
      const scholarship = await storage.getScholarship(id);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      res.json(scholarship);
    } catch (error) {
      console.error(`Error fetching scholarship with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch scholarship", error: (error as Error).message });
    }
  });

  // تعامل مع كل من PUT و PATCH لتحديث المنح الدراسية
  app.put("/api/scholarships/:id", isAdmin, handleUpdateScholarship);
  app.patch("/api/scholarships/:id", isAdmin, handleUpdateScholarship);
  
  // مُعالج مشترك لتحديث المنح الدراسية
  async function handleUpdateScholarship(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid scholarship ID" });
    }
    try {
      console.log("Scholarship update request body:", JSON.stringify(req.body, null, 2));
      
      // معالجة التواريخ قبل التحقق من صحة البيانات
      const processedBody = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      };
      
      const data = insertScholarshipSchema.partial().parse(processedBody);
      console.log("Parsed scholarship data:", JSON.stringify(data, null, 2));
      
      const scholarship = await storage.updateScholarship(id, data);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      res.json(scholarship);
    } catch (error) {
      console.error("Error updating scholarship:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  }

  app.delete("/api/scholarships/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid scholarship ID" });
    }
    const success = await storage.deleteScholarship(id);
    if (!success) {
      return res.status(404).json({ message: "Scholarship not found" });
    }
    res.json({ message: "Scholarship deleted successfully" });
  });

  // Post (article) routes
  app.post("/api/posts", isAdmin, async (req, res) => {
    try {
      // استخراج التصنيفات من البيانات المرسلة
      const { tags, ...postData } = req.body;
      
      // إنشاء المقال في قاعدة البيانات
      const data = insertPostSchema.parse(postData);
      const post = await storage.createPost(data);
      
      // إضافة التصنيفات إلى المقال إذا وجدت
      if (tags && Array.isArray(tags) && tags.length > 0) {
        console.log(`إضافة ${tags.length} تصنيف للمقال ${post.id}`);
        
        for (const tagId of tags) {
          try {
            await storage.addTagToPost(post.id, parseInt(tagId));
          } catch (tagError) {
            console.error(`خطأ في إضافة التصنيف ${tagId} للمقال ${post.id}:`, tagError);
          }
        }
      }
      
      // إرجاع المقال المنشأ مع التصنيفات
      const postWithTags = await storage.getPost(post.id);
      const postTags = await storage.getPostTags(post.id);
      
      res.status(201).json({ ...postWithTags, tags: postTags });
    } catch (error) {
      console.error("خطأ في إنشاء المقال:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/posts", async (req, res) => {
    const { featured, author } = req.query;
    const filters: any = {};
    
    if (featured !== undefined) {
      filters.isFeatured = featured === "true";
    }
    
    if (author) {
      const authorId = parseInt(author as string);
      if (!isNaN(authorId)) {
        filters.authorId = authorId;
      }
    }
    
    const posts = await storage.listPosts(Object.keys(filters).length > 0 ? filters : undefined);
    res.json(posts);
  });

  app.get("/api/posts/featured", async (req, res) => {
    try {
      const posts = await storage.listPosts({ isFeatured: true });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      res.status(500).json({ message: "Failed to fetch featured posts", error: (error as Error).message });
    }
  });

  app.get("/api/posts/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const post = await storage.getPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count
      await storage.incrementPostViews(post.id);
      
      // Get updated post with incremented view count
      const updatedPost = await storage.getPost(post.id);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error fetching post by slug:", error);
      res.status(500).json({ message: "Failed to fetch post", error: (error as Error).message });
    }
  });
  
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      console.log(`Fetching post with ID: ${id}`);
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Increment view count
      await storage.incrementPostViews(id);
      
      // Get updated post with incremented view count
      const updatedPost = await storage.getPost(id);
      res.json(updatedPost);
    } catch (error) {
      console.error(`Error fetching post with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch post", error: (error as Error).message });
    }
  });

  // تحديث المقال باستخدام PUT
  app.put("/api/posts/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    try {
      // استخراج التصنيفات من البيانات المرسلة
      const { tags, ...postData } = req.body;
      
      const data = insertPostSchema.partial().parse(postData);
      console.log("تحديث المقال باستخدام PUT:", id, data);
      
      const post = await storage.updatePost(id, data);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // تحديث التصنيفات إذا تم إرسالها
      if (tags !== undefined) {
        // حذف جميع التصنيفات الحالية
        const currentTags = await storage.getPostTags(id);
        for (const tag of currentTags) {
          await storage.removeTagFromPost(id, tag.id);
        }
        
        // إضافة التصنيفات الجديدة
        if (Array.isArray(tags) && tags.length > 0) {
          for (const tagId of tags) {
            try {
              await storage.addTagToPost(id, parseInt(tagId));
            } catch (tagError) {
              console.error(`خطأ في إضافة التصنيف ${tagId} للمقال ${id}:`, tagError);
            }
          }
        }
      }
      
      // إرجاع المقال المحدث مع التصنيفات
      const updatedPost = await storage.getPost(id);
      const postTags = await storage.getPostTags(id);
      
      res.json({ ...updatedPost, tags: postTags });
    } catch (error) {
      console.error("خطأ في تحديث المقال:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });
  
  // تحديث المقال باستخدام PATCH (لمزيد من التوافق مع الواجهات الأمامية)
  app.patch("/api/posts/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    try {
      // استخراج التصنيفات من البيانات المرسلة
      const { tags, ...postData } = req.body;
      
      const data = insertPostSchema.partial().parse(postData);
      console.log("تحديث المقال باستخدام PATCH:", id, data);
      console.log("محتوى المقال:", data.content);
      
      const post = await storage.updatePost(id, data);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // تحديث التصنيفات إذا تم إرسالها
      if (tags !== undefined) {
        // حذف جميع التصنيفات الحالية
        const currentTags = await storage.getPostTags(id);
        for (const tag of currentTags) {
          await storage.removeTagFromPost(id, tag.id);
        }
        
        // إضافة التصنيفات الجديدة
        if (Array.isArray(tags) && tags.length > 0) {
          for (const tagId of tags) {
            try {
              await storage.addTagToPost(id, parseInt(tagId));
            } catch (tagError) {
              console.error(`خطأ في إضافة التصنيف ${tagId} للمقال ${id}:`, tagError);
            }
          }
        }
      }
      
      // إرجاع المقال المحدث مع التصنيفات
      const updatedPost = await storage.getPost(id);
      const postTags = await storage.getPostTags(id);
      
      res.json({ ...updatedPost, tags: postTags });
    } catch (error) {
      console.error("خطأ في تحديث المقال:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/posts/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    const success = await storage.deletePost(id);
    if (!success) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  });

  // Tag routes
  app.post("/api/tags", isAdmin, async (req, res) => {
    try {
      const data = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(data);
      res.status(201).json(tag);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/tags", async (req, res) => {
    const tags = await storage.listTags();
    res.json(tags);
  });

  // Post-Tag relationship routes
  app.post("/api/posts/:postId/tags/:tagId", isAdmin, async (req, res) => {
    const postId = parseInt(req.params.postId);
    const tagId = parseInt(req.params.tagId);
    
    if (isNaN(postId) || isNaN(tagId)) {
      return res.status(400).json({ message: "Invalid post ID or tag ID" });
    }
    
    const post = await storage.getPost(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const tag = await storage.getTag(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    
    const postTag = await storage.addTagToPost(postId, tagId);
    res.status(201).json(postTag);
  });

  app.get("/api/posts/:postId/tags", async (req, res) => {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    const post = await storage.getPost(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const tags = await storage.getPostTags(postId);
    res.json(tags);
  });

  app.delete("/api/posts/:postId/tags/:tagId", isAdmin, async (req, res) => {
    const postId = parseInt(req.params.postId);
    const tagId = parseInt(req.params.tagId);
    
    if (isNaN(postId) || isNaN(tagId)) {
      return res.status(400).json({ message: "Invalid post ID or tag ID" });
    }
    
    const success = await storage.removeTagFromPost(postId, tagId);
    if (!success) {
      return res.status(404).json({ message: "Post-tag relationship not found" });
    }
    
    res.json({ message: "Tag removed from post successfully" });
  });

  // Success Story routes
  app.post("/api/success-stories", isAdmin, async (req, res) => {
    try {
      const data = insertSuccessStorySchema.parse(req.body);
      const story = await storage.createSuccessStory(data);
      res.status(201).json(story);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/success-stories", async (req, res) => {
    const stories = await storage.listSuccessStories();
    res.json(stories);
  });

  app.get("/api/success-stories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid success story ID" });
    }
    const story = await storage.getSuccessStory(id);
    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }
    res.json(story);
  });

  app.get("/api/success-stories/slug/:slug", async (req, res) => {
    const slug = req.params.slug;
    const story = await storage.getSuccessStoryBySlug(slug);
    if (!story) {
      return res.status(404).json({ message: "Success story not found" });
    }
    res.json(story);
  });

  app.put("/api/success-stories/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid success story ID" });
    }
    try {
      const data = insertSuccessStorySchema.partial().parse(req.body);
      const story = await storage.updateSuccessStory(id, data);
      if (!story) {
        return res.status(404).json({ message: "Success story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/success-stories/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid success story ID" });
    }
    const success = await storage.deleteSuccessStory(id);
    if (!success) {
      return res.status(404).json({ message: "Success story not found" });
    }
    res.json({ message: "Success story deleted successfully" });
  });

  // Newsletter subscriber routes
  app.post("/api/subscribers", async (req, res) => {
    try {
      const data = insertSubscriberSchema.parse(req.body);
      
      // Check if subscriber already exists
      const existingSubscriber = await storage.getSubscriberByEmail(data.email);
      if (existingSubscriber) {
        return res.status(409).json({ message: "Email already subscribed" });
      }
      
      const subscriber = await storage.createSubscriber(data);
      res.status(201).json(subscriber);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/subscribers", isAdmin, async (req, res) => {
    const subscribers = await storage.listSubscribers();
    res.json(subscribers);
  });

  // SEO settings routes
  app.post("/api/seo-settings", isAdmin, async (req, res) => {
    try {
      const data = insertSeoSettingsSchema.parse(req.body);
      
      // Check if setting for this path already exists
      const existingSetting = await storage.getSeoSettingByPath(data.pagePath);
      if (existingSetting) {
        // Update instead of create
        const updated = await storage.updateSeoSetting(existingSetting.id, data);
        return res.json(updated);
      }
      
      const seoSetting = await storage.createSeoSetting(data);
      res.status(201).json(seoSetting);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/seo-settings", isAdmin, async (req, res) => {
    const settings = await storage.listSeoSettings();
    res.json(settings);
  });

  app.get("/api/seo-settings/path", async (req, res) => {
    const path = req.query.path as string;
    if (!path) {
      return res.status(400).json({ message: "Path parameter is required" });
    }
    
    const setting = await storage.getSeoSettingByPath(path);
    if (!setting) {
      return res.json({ 
        pagePath: path,
        metaTitle: "FULLSCO - Scholarship Blog",
        metaDescription: "Find and apply for scholarships worldwide with FULLSCO."
      });
    }
    
    res.json(setting);
  });

  app.put("/api/seo-settings/:id", isAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid SEO setting ID" });
    }
    try {
      const data = insertSeoSettingsSchema.partial().parse(req.body);
      const setting = await storage.updateSeoSetting(id, data);
      if (!setting) {
        return res.status(404).json({ message: "SEO setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Site Settings routes
  app.get("/api/site-settings", async (req, res) => {
    const settings = await storage.getSiteSettings();
    if (!settings) {
      return res.status(404).json({ message: "Site settings not found" });
    }
    res.json(settings);
  });

  // تحديث كل إعدادات الموقع دفعة واحدة
  app.put("/api/site-settings", isAdmin, async (req, res) => {
    try {
      console.log("Received site settings update request:", JSON.stringify(req.body, null, 2));
      
      // حاول التحقق من صحة البيانات
      let data;
      try {
        data = insertSiteSettingsSchema.partial().parse(req.body);
        console.log("Parsed site settings data:", JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error("Site settings validation error:", parseError);
        return res.status(400).json({ 
          message: "Invalid data format", 
          details: (parseError as Error).message 
        });
      }
      
      // تحديث الإعدادات
      const settings = await storage.updateSiteSettings(data);
      console.log("Site settings updated successfully:", JSON.stringify(settings, null, 2));
      
      // إرجاع الإعدادات المحدثة
      res.json(settings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ 
        message: "Failed to update settings", 
        details: (error as Error).message 
      });
    }
  });
  
  // تحديث إعدادات الموقع العامة فقط (التبويب العام)
  app.patch("/api/site-settings/general", isAdmin, async (req, res) => {
    try {
      console.log("Updating general site settings:", JSON.stringify(req.body, null, 2));
      
      const data = insertSiteSettingsSchema.partial().parse({
        siteName: req.body.siteName,
        siteTagline: req.body.siteTagline,
        siteDescription: req.body.siteDescription,
        rtlDirection: req.body.rtlDirection === true,
        enableDarkMode: req.body.enableDarkMode === true,
        defaultLanguage: req.body.defaultLanguage
      });
      
      // تحديث الإعدادات
      const settings = await storage.updateSiteSettings(data);
      console.log("General settings updated successfully");
      
      // إرجاع الإعدادات المحدثة
      res.json(settings);
    } catch (error) {
      console.error("Error updating general settings:", error);
      res.status(500).json({ message: "Failed to update general settings", error: (error as Error).message });
    }
  });
  
  // تحديث إعدادات المظهر والألوان فقط
  app.patch("/api/site-settings/appearance", isAdmin, async (req, res) => {
    try {
      console.log("Updating appearance settings:", JSON.stringify(req.body, null, 2));
      
      const data = insertSiteSettingsSchema.partial().parse({
        primaryColor: req.body.primaryColor,
        secondaryColor: req.body.secondaryColor,
        accentColor: req.body.accentColor,
        favicon: req.body.favicon,
        logo: req.body.logo,
        logoDark: req.body.logoDark,
        customCss: req.body.customCss
      });
      
      const settings = await storage.updateSiteSettings(data);
      console.log("Appearance settings updated successfully");
      
      res.json(settings);
    } catch (error) {
      console.error("Error updating appearance settings:", error);
      res.status(500).json({ message: "Failed to update appearance settings", error: (error as Error).message });
    }
  });
  
  // تحديث معلومات الاتصال فقط
  app.patch("/api/site-settings/contact", isAdmin, async (req, res) => {
    try {
      console.log("Updating contact settings:", JSON.stringify(req.body, null, 2));
      
      const data = insertSiteSettingsSchema.partial().parse({
        email: req.body.email,
        phone: req.body.phone,
        whatsapp: req.body.whatsapp,
        address: req.body.address,
        footerText: req.body.footerText
      });
      
      const settings = await storage.updateSiteSettings(data);
      console.log("Contact settings updated successfully");
      
      res.json(settings);
    } catch (error) {
      console.error("Error updating contact settings:", error);
      res.status(500).json({ message: "Failed to update contact settings", error: (error as Error).message });
    }
  });
  
  // تحديث إعدادات وسائل التواصل الاجتماعي فقط
  app.patch("/api/site-settings/social", isAdmin, async (req, res) => {
    try {
      console.log("Updating social media settings:", JSON.stringify(req.body, null, 2));
      
      const data = insertSiteSettingsSchema.partial().parse({
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        instagram: req.body.instagram,
        youtube: req.body.youtube,
        linkedin: req.body.linkedin
      });
      
      const settings = await storage.updateSiteSettings(data);
      console.log("Social media settings updated successfully");
      
      res.json(settings);
    } catch (error) {
      console.error("Error updating social media settings:", error);
      res.status(500).json({ message: "Failed to update social media settings", error: (error as Error).message });
    }
  });
  
  // تحديث إعدادات الصفحة الرئيسية فقط (إظهار/إخفاء الأقسام)
  app.patch("/api/site-settings/homepage", isAdmin, async (req, res) => {
    try {
      console.log("Updating homepage settings:", JSON.stringify(req.body, null, 2));
      
      // نعين قيم افتراضية لكل القيم البوليانية
      const booleanData = {
        showHeroSection: true,
        showFeaturedScholarships: true, // دائما true لإصلاح المشكلة
        showSearchSection: true,
        showCategoriesSection: true,
        showCountriesSection: true,
        showLatestArticles: true,
        showSuccessStories: true,
        showNewsletterSection: true,
        showStatisticsSection: true,
        showPartnersSection: true,
        enableNewsletter: true,
        enableScholarshipSearch: true
      };
      
      // نستخدم القيم من req.body إذا كانت موجودة وصالحة
      // لكن نضمن أن القيم صحيحة بهذه الطريقة
      
      // المصادقة والتحويل إلى النوع الصحيح
      const data = insertSiteSettingsSchema.partial().parse(booleanData);
      
      console.log("Processing homepage settings with fixed boolean values:", JSON.stringify(data, null, 2));
      
      // تحديث الإعدادات في قاعدة البيانات
      const settings = await storage.updateSiteSettings(data);
      console.log("Homepage settings updated successfully:", settings);
      
      // إرجاع الإعدادات المحدثة
      res.json(settings);
    } catch (error) {
      console.error("Error updating homepage settings:", error);
      res.status(500).json({ message: "Failed to update homepage settings", error: (error as Error).message });
    }
  });
  
  // تحديث عناوين الأقسام فقط
  app.patch("/api/site-settings/sections", isAdmin, async (req, res) => {
    try {
      console.log("Updating section titles and descriptions:", JSON.stringify(req.body, null, 2));
      
      const data = insertSiteSettingsSchema.partial().parse({
        heroTitle: req.body.heroTitle,
        heroDescription: req.body.heroDescription,
        featuredScholarshipsTitle: req.body.featuredScholarshipsTitle,
        featuredScholarshipsDescription: req.body.featuredScholarshipsDescription,
        categoriesSectionTitle: req.body.categoriesSectionTitle,
        categoriesSectionDescription: req.body.categoriesSectionDescription,
        countriesSectionTitle: req.body.countriesSectionTitle,
        countriesSectionDescription: req.body.countriesSectionDescription,
        latestArticlesTitle: req.body.latestArticlesTitle,
        latestArticlesDescription: req.body.latestArticlesDescription,
        successStoriesTitle: req.body.successStoriesTitle,
        successStoriesDescription: req.body.successStoriesDescription,
        newsletterSectionTitle: req.body.newsletterSectionTitle,
        newsletterSectionDescription: req.body.newsletterSectionDescription,
        statisticsSectionTitle: req.body.statisticsSectionTitle,
        statisticsSectionDescription: req.body.statisticsSectionDescription,
        partnersSectionTitle: req.body.partnersSectionTitle,
        partnersSectionDescription: req.body.partnersSectionDescription
      });
      
      const settings = await storage.updateSiteSettings(data);
      console.log("Section titles updated successfully");
      
      res.json(settings);
    } catch (error) {
      console.error("Error updating section titles:", error);
      res.status(500).json({ message: "Failed to update section titles", error: (error as Error).message });
    }
  });

  // Analytics routes
  app.get("/api/analytics/visits", isAdmin, async (req, res) => {
    try {
      const period = req.query.period as string || 'monthly';
      const data = await storage.getVisitStats(period);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/analytics/posts", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getPostStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/analytics/scholarships", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getScholarshipStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/analytics/traffic-sources", isAdmin, async (req, res) => {
    try {
      const sources = await storage.getTrafficSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/analytics/top-content", isAdmin, async (req, res) => {
    try {
      const type = req.query.type as string || 'posts';
      const limit = parseInt(req.query.limit as string || '5');
      const content = await storage.getTopContent(type, limit);
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/analytics/dashboard", isAdmin, async (req, res) => {
    try {
      // جمع كل بيانات التحليلات في طلب واحد للوحة المعلومات
      const period = req.query.period as string || 'monthly';
      
      const [visitStats, postStats, scholarshipStats, trafficSources, topPosts, topScholarships] = await Promise.all([
        storage.getVisitStats(period),
        storage.getPostStats(),
        storage.getScholarshipStats(),
        storage.getTrafficSources(),
        storage.getTopContent('posts', 5),
        storage.getTopContent('scholarships', 5)
      ]);
      
      res.json({
        visitStats,
        postStats,
        scholarshipStats,
        trafficSources,
        topContent: {
          posts: topPosts,
          scholarships: topScholarships
        }
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Static Pages Routes
  // إنشاء صفحة ثابتة جديدة (مدير فقط)
  app.post("/api/pages", isAdmin, async (req, res) => {
    try {
      const data = insertPageSchema.parse(req.body);
      const page = await storage.createPage(data);
      res.status(201).json(page);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // الحصول على جميع الصفحات الثابتة للإدارة (مدير فقط)
  app.get("/api/admin/pages", isAdmin, async (req, res) => {
    try {
      const pages = await storage.listPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // الحصول على جميع الصفحات الثابتة المنشورة للعرض في الواجهة الأمامية
  app.get("/api/pages", async (req, res) => {
    try {
      // تصفية حسب المكان: الرأس أو التذييل أو كل الصفحات المنشورة
      const showInHeader = req.query.header === "true";
      const showInFooter = req.query.footer === "true";
      
      const filters: {
        isPublished: boolean;
        showInHeader?: boolean;
        showInFooter?: boolean;
      } = {
        isPublished: true
      };
      
      if (req.query.header !== undefined) {
        filters.showInHeader = showInHeader;
      }
      
      if (req.query.footer !== undefined) {
        filters.showInFooter = showInFooter;
      }
      
      const pages = await storage.listPages(filters);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // الحصول على صفحة ثابتة محددة بواسطة المعرف (مدير فقط للصفحات غير المنشورة)
  app.get("/api/pages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "معرف الصفحة غير صالح" });
      }
      
      const page = await storage.getPage(id);
      if (!page) {
        return res.status(404).json({ message: "الصفحة غير موجودة" });
      }
      
      // إذا كانت الصفحة غير منشورة، يجب أن يكون المستخدم مديرًا
      if (!page.isPublished && (!req.isAuthenticated() || (req.user as User).role !== "admin")) {
        return res.status(403).json({ message: "غير مصرح بالوصول" });
      }
      
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // الحصول على صفحة ثابتة محددة بواسطة الرابط المختصر
  app.get("/api/pages/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const page = await storage.getPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ message: "الصفحة غير موجودة" });
      }
      
      // إذا كانت الصفحة غير منشورة، يجب أن يكون المستخدم مديرًا
      if (!page.isPublished && (!req.isAuthenticated() || (req.user as User).role !== "admin")) {
        return res.status(403).json({ message: "غير مصرح بالوصول" });
      }
      
      res.json(page);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // تحديث صفحة ثابتة (مدير فقط)
  app.put("/api/pages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "معرف الصفحة غير صالح" });
      }
      
      const data = insertPageSchema.partial().parse(req.body);
      const page = await storage.updatePage(id, data);
      
      if (!page) {
        return res.status(404).json({ message: "الصفحة غير موجودة" });
      }
      
      res.json(page);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // حذف صفحة ثابتة (مدير فقط)
  app.delete("/api/pages/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "معرف الصفحة غير صالح" });
      }
      
      const success = await storage.deletePage(id);
      if (!success) {
        return res.status(404).json({ message: "الصفحة غير موجودة" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Menu Routes
  app.post("/api/menus", isAdmin, async (req, res) => {
    try {
      const data = insertMenuSchema.parse(req.body);
      const menu = await storage.createMenu(data);
      res.status(201).json(menu);
    } catch (error) {
      console.error("Error creating menu:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/menus", async (req, res) => {
    try {
      const menus = await storage.listMenus();
      res.json(menus);
    } catch (error) {
      console.error("Error fetching menus:", error);
      res.status(500).json({ message: "Failed to fetch menus", error: (error as Error).message });
    }
  });

  app.get("/api/menus/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      const menu = await storage.getMenu(id);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      res.json(menu);
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ message: "Failed to fetch menu", error: (error as Error).message });
    }
  });

  app.get("/api/menus/location/:location", async (req, res) => {
    try {
      const location = req.params.location;
      if (!["header", "footer", "sidebar", "mobile"].includes(location)) {
        return res.status(400).json({ message: "Invalid menu location" });
      }
      const menu = await storage.getMenuByLocation(location);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found for this location" });
      }
      res.json(menu);
    } catch (error) {
      console.error("Error fetching menu by location:", error);
      res.status(500).json({ message: "Failed to fetch menu", error: (error as Error).message });
    }
  });

  app.get("/api/menus/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const menu = await storage.getMenuBySlug(slug);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      res.json(menu);
    } catch (error) {
      console.error("Error fetching menu by slug:", error);
      res.status(500).json({ message: "Failed to fetch menu", error: (error as Error).message });
    }
  });

  // GET أساسي للهيكل لاسترجاع جميع القوائم
  app.get("/api/menu-structure", async (req, res) => {
    try {
      const locations = ["header", "footer", "sidebar", "mobile"];
      const structures = {};
      
      for (const loc of locations) {
        try {
          const structure = await storage.getMenuStructure(loc);
          if (structure) {
            structures[loc] = structure;
          }
        } catch (innerError) {
          console.error(`Error fetching menu structure for ${loc}:`, innerError);
          // استمر في المحاولة مع المواقع الأخرى
        }
      }
      
      res.json(structures);
    } catch (error) {
      console.error("Error fetching all menu structures:", error);
      res.status(500).json({ message: "Failed to fetch menu structures", error: (error as Error).message });
    }
  });

  // GET محدد للهيكل بناءً على الموقع
  app.get("/api/menu-structure/:location", async (req, res) => {
    try {
      const location = req.params.location;
      if (!["header", "footer", "sidebar", "mobile"].includes(location)) {
        return res.status(400).json({ message: "Invalid menu location" });
      }
      const structure = await storage.getMenuStructure(location);
      if (!structure) {
        return res.status(404).json({ message: "Menu structure not found for this location" });
      }
      res.json(structure);
    } catch (error) {
      console.error("Error fetching menu structure:", error);
      res.status(500).json({ message: "Failed to fetch menu structure", error: (error as Error).message });
    }
  });

  app.put("/api/menus/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      const data = insertMenuSchema.partial().parse(req.body);
      const menu = await storage.updateMenu(id, data);
      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }
      res.json(menu);
    } catch (error) {
      console.error("Error updating menu:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/menus/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      const success = await storage.deleteMenu(id);
      if (!success) {
        return res.status(404).json({ message: "Menu not found" });
      }
      res.json({ message: "Menu deleted successfully" });
    } catch (error) {
      console.error("Error deleting menu:", error);
      res.status(500).json({ message: "Failed to delete menu", error: (error as Error).message });
    }
  });

  // Menu Item Routes
  app.post("/api/menu-items", isAdmin, async (req, res) => {
    try {
      const data = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(data);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ message: "Failed to fetch menu item", error: (error as Error).message });
    }
  });

  app.get("/api/menu-items/menu/:menuId", async (req, res) => {
    try {
      const menuId = parseInt(req.params.menuId);
      if (isNaN(menuId)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      
      let parentId: number | null | undefined = undefined;
      if (req.query.parentId !== undefined) {
        if (req.query.parentId === 'null') {
          parentId = null;
        } else {
          const parsedParentId = parseInt(req.query.parentId as string);
          if (!isNaN(parsedParentId)) {
            parentId = parsedParentId;
          } else {
            return res.status(400).json({ message: "Invalid parent ID" });
          }
        }
      }
      
      const menuItems = await storage.listMenuItems(menuId, parentId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items", error: (error as Error).message });
    }
  });

  app.get("/api/menu-items-with-details/menu/:menuId", async (req, res) => {
    try {
      const menuId = parseInt(req.params.menuId);
      if (isNaN(menuId)) {
        return res.status(400).json({ message: "Invalid menu ID" });
      }
      const menuItems = await storage.getAllMenuItemsWithDetails(menuId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items with details:", error);
      res.status(500).json({ message: "Failed to fetch menu items with details", error: (error as Error).message });
    }
  });

  app.put("/api/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const data = insertMenuItemSchema.partial().parse(req.body);
      const menuItem = await storage.updateMenuItem(id, data);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const success = await storage.deleteMenuItem(id);
      if (!success) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item", error: (error as Error).message });
    }
  });

  // Media routes
  // Get a list of all media files
  app.get("/api/media", async (req, res) => {
    try {
      const mimeType = req.query.mimeType as string | undefined;
      const filters = mimeType ? { mimeType } : undefined;
      const mediaFiles = await storage.listMediaFiles(filters);
      res.json(mediaFiles);
    } catch (error) {
      console.error("Error fetching media files:", error);
      res.status(500).json({ message: "Failed to fetch media files", error: (error as Error).message });
    }
  });

  // Get a single media file by ID
  app.get("/api/media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid media file ID" });
      }
      const mediaFile = await storage.getMediaFile(id);
      if (!mediaFile) {
        return res.status(404).json({ message: "Media file not found" });
      }
      res.json(mediaFile);
    } catch (error) {
      console.error("Error fetching media file:", error);
      res.status(500).json({ message: "Failed to fetch media file", error: (error as Error).message });
    }
  });

  // Upload a new media file
  app.post("/api/media", isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Process the uploaded file
      const file = req.file;
      
      // استخراج أبعاد الصورة إذا كانت الملف هو صورة
      let width = null;
      let height = null;
      
      if (file.mimetype.startsWith('image/')) {
        try {
          const filePath = path.join(uploadsDir, file.filename);
          const dimensions = sizeOf(filePath);
          width = dimensions.width;
          height = dimensions.height;
          console.log(`Image dimensions: ${width}x${height}`);
        } catch (err) {
          console.error("Error getting image dimensions:", err);
          // استمر في المعالجة حتى لو لم يتم استخراج الأبعاد
        }
      }
      
      // Use relative URL instead of absolute URL to avoid server-specific paths
      const fileData = {
        filename: file.filename,
        originalFilename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        width,
        height,
        title: req.body.title || file.originalname,
        alt: req.body.alt || ''
      };

      console.log("Uploading file with data:", fileData);
      
      // Save media file to database
      const mediaFile = await storage.createMediaFile(fileData);
      
      // Return success response
      res.status(201).json(mediaFile);
    } catch (error) {
      console.error("Error creating media file:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Update an existing media file
  app.put("/api/media/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid media file ID" });
      }
      const data = insertMediaFileSchema.partial().parse(req.body);
      const mediaFile = await storage.updateMediaFile(id, data);
      if (!mediaFile) {
        return res.status(404).json({ message: "Media file not found" });
      }
      res.json(mediaFile);
    } catch (error) {
      console.error("Error updating media file:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Delete a media file
  app.delete("/api/media/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid media file ID" });
      }
      const success = await storage.deleteMediaFile(id);
      if (!success) {
        return res.status(404).json({ message: "Media file not found" });
      }
      res.json({ message: "Media file deleted successfully" });
    } catch (error) {
      console.error("Error deleting media file:", error);
      res.status(500).json({ message: "Failed to delete media file", error: (error as Error).message });
    }
  });

  // Bulk delete media files
  app.post("/api/media/bulk-delete", isAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.some(id => typeof id !== 'number')) {
        return res.status(400).json({ message: "Invalid IDs format. Expected an array of numbers." });
      }
      
      const success = await storage.bulkDeleteMediaFiles(ids);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete some media files" });
      }
      
      res.json({ message: "Media files deleted successfully" });
    } catch (error) {
      console.error("Error bulk deleting media files:", error);
      res.status(500).json({ message: "Failed to delete media files", error: (error as Error).message });
    }
  });

  // Statistics routes
  app.get("/api/statistics", async (req, res) => {
    try {
      const { active } = req.query;
      const filters: any = {};
      
      if (active !== undefined) {
        filters.isActive = active === "true";
      }
      
      const statistics = await storage.listStatistics(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics", error: (error as Error).message });
    }
  });

  app.get("/api/statistics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid statistic ID" });
      }
      const statistic = await storage.getStatistic(id);
      if (!statistic) {
        return res.status(404).json({ message: "Statistic not found" });
      }
      res.json(statistic);
    } catch (error) {
      console.error("Error fetching statistic:", error);
      res.status(500).json({ message: "Failed to fetch statistic", error: (error as Error).message });
    }
  });

  app.post("/api/statistics", isAdmin, async (req, res) => {
    try {
      const data = insertStatisticSchema.parse(req.body);
      const statistic = await storage.createStatistic(data);
      res.status(201).json(statistic);
    } catch (error) {
      console.error("Error creating statistic:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/api/statistics/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid statistic ID" });
      }
      const data = insertStatisticSchema.partial().parse(req.body);
      const statistic = await storage.updateStatistic(id, data);
      if (!statistic) {
        return res.status(404).json({ message: "Statistic not found" });
      }
      res.json(statistic);
    } catch (error) {
      console.error("Error updating statistic:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/statistics/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid statistic ID" });
      }
      const success = await storage.deleteStatistic(id);
      if (!success) {
        return res.status(404).json({ message: "Statistic not found" });
      }
      res.json({ message: "Statistic deleted successfully" });
    } catch (error) {
      console.error("Error deleting statistic:", error);
      res.status(500).json({ message: "Failed to delete statistic", error: (error as Error).message });
    }
  });

  // Partners routes
  app.get("/api/partners", async (req, res) => {
    try {
      const { active } = req.query;
      const filters: any = {};
      
      if (active !== undefined) {
        filters.isActive = active === "true";
      }
      
      const partners = await storage.listPartners(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: "Failed to fetch partners", error: (error as Error).message });
    }
  });

  app.get("/api/partners/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid partner ID" });
      }
      const partner = await storage.getPartner(id);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      console.error("Error fetching partner:", error);
      res.status(500).json({ message: "Failed to fetch partner", error: (error as Error).message });
    }
  });

  app.post("/api/partners", isAdmin, async (req, res) => {
    try {
      const data = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(data);
      res.status(201).json(partner);
    } catch (error) {
      console.error("Error creating partner:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/api/partners/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid partner ID" });
      }
      const data = insertPartnerSchema.partial().parse(req.body);
      const partner = await storage.updatePartner(id, data);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      console.error("Error updating partner:", error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/partners/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid partner ID" });
      }
      const success = await storage.deletePartner(id);
      if (!success) {
        return res.status(404).json({ message: "Partner not found" });
      }
      res.json({ message: "Partner deleted successfully" });
    } catch (error) {
      console.error("Error deleting partner:", error);
      res.status(500).json({ message: "Failed to delete partner", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
