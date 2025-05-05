import React, { useState } from "react";
import { 
  PlusCircle, 
  RefreshCw, 
  Edit, 
  Trash2, 
  ExternalLink,
  Menu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Statistic } from "@shared/schema";
import AdminLayout from "@/components/layout/admin-layout";
import Loader from "@/components/ui/loader";
import { useNavigate } from "wouter";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

// Definir el esquema de validación
const statisticFormSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  value: z.string().min(1, "القيمة مطلوبة"),
  icon: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.coerce.number().optional(),
});

type StatisticFormValues = z.infer<typeof statisticFormSchema>;

export default function StatisticsPage() {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStatistic, setEditingStatistic] = useState<Statistic | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statisticToDelete, setStatisticToDelete] = useState<Statistic | null>(null);
  const { isMobile } = useMobile();
  const navigate = useNavigate();

  // Query para obtener las estadísticas
  const { 
    data: statistics, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['/api/statistics'],
    queryFn: () => apiRequest('/api/statistics')
  });

  // Formulario para crear/editar estadísticas
  const form = useForm<StatisticFormValues>({
    resolver: zodResolver(statisticFormSchema),
    defaultValues: {
      title: "",
      value: "",
      icon: "",
      color: "#3b82f6",
      description: "",
      isActive: true,
      order: 0,
    },
  });

  // Mutation para crear una estadística
  const createMutation = useMutation({
    mutationFn: (data: StatisticFormValues) => 
      apiRequest('/api/statistics', {
        method: 'POST',
        data
      }),
    onSuccess: () => {
      toast({
        title: "تم إنشاء الإحصائية",
        description: "تم إضافة الإحصائية بنجاح",
      });
      setOpenDialog(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
    },
    onError: (error: any) => {
      console.error("Error creating statistic:", error);
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء إنشاء الإحصائية",
        variant: "destructive",
      });
    }
  });

  // Mutation para actualizar una estadística
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; values: StatisticFormValues }) => 
      apiRequest(`/api/statistics/${data.id}`, {
        method: 'PUT',
        data: data.values
      }),
    onSuccess: () => {
      toast({
        title: "تم تحديث الإحصائية",
        description: "تم تحديث الإحصائية بنجاح",
      });
      setOpenDialog(false);
      setEditingStatistic(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
    },
    onError: (error: any) => {
      console.error("Error updating statistic:", error);
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء تحديث الإحصائية",
        variant: "destructive",
      });
    }
  });

  // Mutation para eliminar una estadística
  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/statistics/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      toast({
        title: "تم حذف الإحصائية",
        description: "تم حذف الإحصائية بنجاح",
      });
      setDeleteDialogOpen(false);
      setStatisticToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
    },
    onError: (error: any) => {
      console.error("Error deleting statistic:", error);
      toast({
        title: "خطأ",
        description: error?.message || "حدث خطأ أثناء حذف الإحصائية",
        variant: "destructive",
      });
    }
  });

  // Función para abrir el diálogo de creación
  const handleCreate = () => {
    form.reset({
      title: "",
      value: "",
      icon: "",
      color: "#3b82f6",
      description: "",
      isActive: true,
      order: 0,
    });
    setEditingStatistic(null);
    setOpenDialog(true);
  };

  // Función para abrir el diálogo de edición
  const handleEdit = (statistic: Statistic) => {
    form.reset({
      title: statistic.title,
      value: statistic.value,
      icon: statistic.icon || "",
      color: statistic.color || "#3b82f6",
      description: statistic.description || "",
      isActive: statistic.isActive,
      order: statistic.order || 0,
    });
    setEditingStatistic(statistic);
    setOpenDialog(true);
  };

  // Función para abrir el diálogo de eliminación
  const handleDelete = (statistic: Statistic) => {
    setStatisticToDelete(statistic);
    setDeleteDialogOpen(true);
  };

  // Función para manejar el envío del formulario
  const onSubmit = (values: StatisticFormValues) => {
    if (editingStatistic) {
      updateMutation.mutate({ id: editingStatistic.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout activeItem="statistics">
        <div className="flex justify-center items-center h-40">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout activeItem="statistics">
        <div className="text-center text-red-500 p-6">
          <h2 className="text-xl">خطأ في تحميل البيانات</h2>
          <p>{(error as Error)?.message || "حدث خطأ أثناء تحميل الإحصائيات"}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      activeItem="statistics"
      title="إدارة الإحصائيات"
      actions={
        <>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button onClick={handleCreate}>
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة إحصائية جديدة
          </Button>
        </>
      }
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الترتيب</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">القيمة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">اللون</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics && statistics.length > 0 ? (
                statistics.map((statistic: Statistic) => (
                  <TableRow key={statistic.id}>
                    <TableCell>{statistic.order || 0}</TableCell>
                    <TableCell className="font-medium">
                      {statistic.title}
                      {statistic.icon && (
                        <span className="mr-2 inline-block" title="أيقونة">
                          {statistic.icon}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{statistic.value}</TableCell>
                    <TableCell>
                      <Badge
                        variant={statistic.isActive ? "default" : "outline"}
                        className={cn(
                          statistic.isActive ? "bg-green-500 hover:bg-green-600" : "text-gray-500"
                        )}
                      >
                        {statistic.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {statistic.color ? (
                        <div 
                          className="w-6 h-6 rounded-full border" 
                          style={{ backgroundColor: statistic.color }}
                          title={statistic.color}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(statistic)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(statistic)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    لا توجد إحصائيات بعد. أضف إحصائية جديدة.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog para crear/editar estadísticas */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStatistic ? "تعديل إحصائية" : "إضافة إحصائية جديدة"}
            </DialogTitle>
            <DialogDescription>
              {editingStatistic
                ? "قم بتعديل تفاصيل الإحصائية"
                : "أدخل تفاصيل الإحصائية الجديدة"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: عدد المنح" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القيمة</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: 5000+" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأيقونة (اختياري)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: 📊" />
                    </FormControl>
                    <FormDescription>
                      يمكنك استخدام رموز تعبيرية أو أكواد HTML للأيقونات
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللون (اختياري)</FormLabel>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        {...field} 
                        className="w-12 h-10 p-1" 
                      />
                      <Input 
                        type="text" 
                        value={field.value} 
                        onChange={field.onChange}
                        placeholder="#3b82f6" 
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="وصف إضافي للإحصائية"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الترتيب</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(parseInt(value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      ترتيب ظهور الإحصائية، الأرقام الأصغر تظهر أولاً
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>نشط</FormLabel>
                      <FormDescription>
                        تفعيل أو تعطيل ظهور الإحصائية في الموقع
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader className="ml-2" size={16} />
                      جار الحفظ...
                    </>
                  ) : (
                    editingStatistic ? "تحديث" : "إضافة"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الإحصائية؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الإحصائية "{statisticToDelete?.title}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
              onClick={() => statisticToDelete && deleteMutation.mutate(statisticToDelete.id)}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader className="ml-2" size={16} />
                  جار الحذف...
                </>
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}