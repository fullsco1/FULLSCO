import React from 'react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { 
  GraduationCap, 
  Globe, 
  Users, 
  Award, 
  BookOpen, 
  Building, 
  Briefcase, 
  School 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatisticBoxProps {
  icon: React.ReactNode;
  count: string;
  label: string;
  color: string;
}

const StatisticBox = ({ icon, count, label, color }: StatisticBoxProps) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-muted bg-gradient-to-br from-background to-muted/30 p-6 backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
      `hover:border-${color}-200 hover:shadow-${color}-100/20`
    )}>
      <div className={cn("absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-30 blur-xl", `bg-${color}-500/40`)}></div>
      <div className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-lg transition-transform duration-300 hover:scale-110", `bg-${color}-500/10 text-${color}-500`)}>
        {icon}
      </div>
      <p className={cn("text-3xl font-bold transition-transform duration-200 hover:scale-105", `text-${color}-500`)}>{count}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

const Statistics = () => {
  const { siteSettings, isLoading } = useSiteSettings();
  
  if (isLoading) {
    return (
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-muted"></div>
            <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded-full bg-muted"></div>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold">
            {siteSettings.statisticsSectionTitle || "إحصائيات"}
          </h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            {siteSettings.statisticsSectionDescription || "أرقام عن المنح الدراسية والطلاب حول العالم"}
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatisticBox 
            icon={<Award className="h-7 w-7" />} 
            count="+1000" 
            label="منحة دراسية متاحة" 
            color="primary"
          />
          <StatisticBox 
            icon={<Globe className="h-7 w-7" />} 
            count="+50" 
            label="دولة حول العالم" 
            color="secondary"
          />
          <StatisticBox 
            icon={<Users className="h-7 w-7" />} 
            count="+10,000" 
            label="طالب استفادوا من المنح" 
            color="accent"
          />
          <StatisticBox 
            icon={<School className="h-7 w-7" />} 
            count="+250" 
            label="جامعة حول العالم" 
            color="primary"
          />
        </div>
      </div>
    </section>
  );
};

export default Statistics;