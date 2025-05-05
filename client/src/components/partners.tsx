import React from 'react';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';

// استخدم مكتبة react-icons للشعارات
import { 
  SiHarvard, 
  SiStanford, 
  SiMit, 
  SiCambridge, 
  SiOxford, 
  SiBerkeley,
  SiYale,
  SiPrinceton
} from 'react-icons/si';

interface PartnerLogoProps {
  icon: React.ReactNode;
  name: string;
}

const PartnerLogo = ({ icon, name }: PartnerLogoProps) => {
  return (
    <div className="group flex flex-col items-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-muted bg-background p-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5">
        <div className="text-4xl text-gray-500 transition-colors duration-300 group-hover:text-primary">
          {icon}
        </div>
      </div>
      <span className="mt-2 text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
        {name}
      </span>
    </div>
  );
};

const Partners = () => {
  const { siteSettings, isLoading } = useSiteSettings();
  
  const partnerLogos = [
    { icon: <SiHarvard />, name: "جامعة هارفارد" },
    { icon: <SiStanford />, name: "جامعة ستانفورد" },
    { icon: <SiMit />, name: "معهد ماساتشوستس للتكنولوجيا" },
    { icon: <SiCambridge />, name: "جامعة كامبريدج" },
    { icon: <SiOxford />, name: "جامعة أكسفورد" },
    { icon: <SiBerkeley />, name: "جامعة بيركلي" },
    { icon: <SiYale />, name: "جامعة ييل" },
    { icon: <SiPrinceton />, name: "جامعة برينستون" },
  ];
  
  if (isLoading) {
    return (
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-muted"></div>
            <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded-full bg-muted"></div>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold">
            {siteSettings.partnersSectionTitle || "شركاؤنا"}
          </h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            {siteSettings.partnersSectionDescription || "المؤسسات والجامعات التي نتعاون معها"}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-8">
          {partnerLogos.map((partner, index) => (
            <PartnerLogo 
              key={index}
              icon={partner.icon}
              name={partner.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;