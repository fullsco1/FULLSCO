import { Request, Response } from 'express';
import { StatisticsService } from '../services/statistics-service.ts';
import { insertStatisticSchema } from '../../shared/schema';
import { handleException, successResponse } from '../utils/api-helper.ts';

export class StatisticsController {
  private service: StatisticsService;

  constructor() {
    this.service = new StatisticsService();
  }

  /**
   * الحصول على قائمة الإحصاءات
   */
  async listStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { isActive } = req.query;
      const activeFilter = isActive !== undefined ? isActive === 'true' : undefined;
      
      const statistics = await this.service.listStatistics(activeFilter);
      res.json(successResponse(statistics));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * الحصول على إحصائية بواسطة المعرف
   */
  async getStatisticById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف الإحصائية يجب أن يكون رقماً'
        });
        return;
      }

      const statistic = await this.service.getStatisticById(id);
      if (!statistic) {
        res.status(404).json({
          success: false,
          message: 'الإحصائية غير موجودة'
        });
        return;
      }

      res.json(successResponse(statistic));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * إنشاء إحصائية جديدة
   */
  async createStatistic(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = insertStatisticSchema.parse(req.body);
      const newStatistic = await this.service.createStatistic(validatedData);
      
      res.status(201).json(successResponse(
        newStatistic,
        'تم إنشاء الإحصائية بنجاح'
      ));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * تحديث إحصائية موجودة
   */
  async updateStatistic(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف الإحصائية يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود الإحصائية
      const existingStatistic = await this.service.getStatisticById(id);
      if (!existingStatistic) {
        res.status(404).json({
          success: false,
          message: 'الإحصائية غير موجودة'
        });
        return;
      }

      // تحديث الإحصائية
      const validatedData = insertStatisticSchema.partial().parse(req.body);
      const updatedStatistic = await this.service.updateStatistic(id, validatedData);
      
      res.json(successResponse(
        updatedStatistic,
        'تم تحديث الإحصائية بنجاح'
      ));
    } catch (error) {
      handleException(res, error);
    }
  }

  /**
   * حذف إحصائية
   */
  async deleteStatistic(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'معرف الإحصائية يجب أن يكون رقماً'
        });
        return;
      }

      // تحقق من وجود الإحصائية
      const existingStatistic = await this.service.getStatisticById(id);
      if (!existingStatistic) {
        res.status(404).json({
          success: false,
          message: 'الإحصائية غير موجودة'
        });
        return;
      }

      // حذف الإحصائية
      const result = await this.service.deleteStatistic(id);
      
      if (result) {
        res.json({
          success: true,
          message: 'تم حذف الإحصائية بنجاح'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'فشل في حذف الإحصائية'
        });
      }
    } catch (error) {
      handleException(res, error);
    }
  }
}