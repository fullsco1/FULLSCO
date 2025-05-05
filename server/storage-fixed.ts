import {
  users, User, InsertUser,
  categories, Category, InsertCategory,
  levels, Level, InsertLevel,
  countries, Country, InsertCountry,
  scholarships, Scholarship, InsertScholarship,
  posts, Post, InsertPost,
  tags, Tag, InsertTag,
  postTags, PostTag, InsertPostTag,
  successStories, SuccessStory, InsertSuccessStory,
  subscribers, Subscriber, InsertSubscriber,
  seoSettings, SeoSetting, InsertSeoSetting,
  siteSettings, SiteSetting, InsertSiteSetting,
  pages, Page, InsertPage,
  menus, Menu, InsertMenu,
  menuItems, MenuItem, InsertMenuItem,
  mediaFiles, MediaFile, InsertMediaFile
} from "@shared/schema";
import { db } from "./db";
import { eq, and, count, sql } from "drizzle-orm";
import { DatabaseStorage } from "./db-storage";

// Storage interface
export interface IStorage {
  // Media operations
  getMediaFile(id: number): Promise<MediaFile | undefined>;
  createMediaFile(mediaFile: InsertMediaFile): Promise<MediaFile>;
  updateMediaFile(id: number, mediaFile: Partial<InsertMediaFile>): Promise<MediaFile | undefined>;
  deleteMediaFile(id: number): Promise<boolean>;
  listMediaFiles(filters?: { mimeType?: string }): Promise<MediaFile[]>;
  bulkDeleteMediaFiles(ids: number[]): Promise<boolean>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  
  // Static Page operations
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<boolean>;
  listPages(filters?: { isPublished?: boolean, showInHeader?: boolean, showInFooter?: boolean }): Promise<Page[]>;

  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  listCategories(): Promise<Category[]>;

  // Level operations
  getLevel(id: number): Promise<Level | undefined>;
  getLevelBySlug(slug: string): Promise<Level | undefined>;
  createLevel(level: InsertLevel): Promise<Level>;
  listLevels(): Promise<Level[]>;

  // Country operations
  getCountry(id: number): Promise<Country | undefined>;
  getCountryBySlug(slug: string): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  listCountries(): Promise<Country[]>;

  // Scholarship operations
  getScholarship(id: number): Promise<Scholarship | undefined>;
  getScholarshipBySlug(slug: string): Promise<Scholarship | undefined>;
  createScholarship(scholarship: InsertScholarship): Promise<Scholarship>;
  updateScholarship(id: number, scholarship: Partial<InsertScholarship>): Promise<Scholarship | undefined>;
  deleteScholarship(id: number): Promise<boolean>;
  listScholarships(filters?: { isFeatured?: boolean, countryId?: number, levelId?: number, categoryId?: number }): Promise<Scholarship[]>;

  // Post operations
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  incrementPostViews(id: number): Promise<boolean>;
  listPosts(filters?: { isFeatured?: boolean, authorId?: number }): Promise<Post[]>;

  // Tag operations
  getTag(id: number): Promise<Tag | undefined>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  listTags(): Promise<Tag[]>;

  // Post-Tag operations
  getPostTags(postId: number): Promise<Tag[]>;
  getTagPosts(tagId: number): Promise<Post[]>;
  addTagToPost(postId: number, tagId: number): Promise<PostTag>;
  removeTagFromPost(postId: number, tagId: number): Promise<boolean>;

  // Success Story operations
  getSuccessStory(id: number): Promise<SuccessStory | undefined>;
  getSuccessStoryBySlug(slug: string): Promise<SuccessStory | undefined>;
  createSuccessStory(story: InsertSuccessStory): Promise<SuccessStory>;
  updateSuccessStory(id: number, story: Partial<InsertSuccessStory>): Promise<SuccessStory | undefined>;
  deleteSuccessStory(id: number): Promise<boolean>;
  listSuccessStories(): Promise<SuccessStory[]>;

  // Newsletter subscriber operations
  getSubscriber(id: number): Promise<Subscriber | undefined>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  listSubscribers(): Promise<Subscriber[]>;

  // SEO settings operations
  getSeoSetting(id: number): Promise<SeoSetting | undefined>;
  getSeoSettingByPath(pagePath: string): Promise<SeoSetting | undefined>;
  createSeoSetting(seoSetting: InsertSeoSetting): Promise<SeoSetting>;
  updateSeoSetting(id: number, seoSetting: Partial<InsertSeoSetting>): Promise<SeoSetting | undefined>;
  listSeoSettings(): Promise<SeoSetting[]>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSetting | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSetting>): Promise<SiteSetting>;

  // Analytics operations
  getVisitStats(period?: string): Promise<any>;
  getPostStats(): Promise<any>;
  getScholarshipStats(): Promise<any>;
  getTrafficSources(): Promise<any>;
  getTopContent(type?: string, limit?: number): Promise<any>;
  
  // Menu operations
  getMenu(id: number): Promise<Menu | undefined>;
  getMenuBySlug(slug: string): Promise<Menu | undefined>;
  getMenuByLocation(location: string): Promise<Menu | undefined>;
  createMenu(menu: InsertMenu): Promise<Menu>;
  updateMenu(id: number, menu: Partial<InsertMenu>): Promise<Menu | undefined>;
  deleteMenu(id: number): Promise<boolean>;
  listMenus(): Promise<Menu[]>;
  
  // Menu Item operations
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  listMenuItems(menuId: number, parentId?: number | null): Promise<MenuItem[]>;
  getAllMenuItemsWithDetails(menuId: number): Promise<any[]>;
  getMenuStructure(location: string): Promise<any>;
}

// Using DatabaseStorage implementation from db-storage.ts
export const storage = new DatabaseStorage();

// Adding menu-related functions to the storage object
storage.getMenuByLocation = async (location: string): Promise<Menu | undefined> => {
  try {
    const [menu] = await db.select().from(menus).where(eq(menus.location, location));
    return menu;
  } catch (error) {
    // إذا كان هناك خطأ بسبب عدم وجود جدول، نعيد `undefined` بدلاً من رمي خطأ
    console.error("Error getting menu by location:", error);
    return undefined;
  }
};

storage.getMenuStructure = async (location: string): Promise<any> => {
  try {
    // Get the menu by location
    const menu = await storage.getMenuByLocation(location);
    if (!menu) {
      return null;
    }
    
    // Get the root items (parentId is null)
    const rootItems = await storage.listMenuItems(menu.id, null);
    
    // Prepare the structure
    const structure = {
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      location: menu.location,
      items: []
    };
    
    // For each root item, get the children
    for (const rootItem of rootItems) {
      const item: any = { ...rootItem, children: [] };
      
      if (rootItem.id) {
        // Get the children for this root item
        const children = await storage.listMenuItems(menu.id, rootItem.id);
        item.children = children || [];
      }
      
      structure.items.push(item);
    }
    
    return structure;
  } catch (error) {
    // إذا كان هناك خطأ بسبب عدم وجود جدول، نعيد null بدلاً من رمي خطأ
    console.error(`Error getting menu structure for ${location}:`, error);
    return null; // Return null instead of throwing error
  }
};