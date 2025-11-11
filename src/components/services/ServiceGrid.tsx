import { ServiceCard } from "./ServiceCard";

interface Service {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  isActive: boolean;
}

interface ServiceGridProps {
  services: Service[];
  title: string;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onToggleActive: (serviceId: string) => void;
}

export const ServiceGrid = ({ 
  services, 
  title, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: ServiceGridProps) => {
  if (services.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className={`text-xl font-semibold ${!services[0].isActive ? 'text-gray-500' : ''}`}>
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={() => onEdit(service)}
            onDelete={() => onDelete(service.id)}
            onToggleActive={() => onToggleActive(service.id)}
          />
        ))}
      </div>
    </div>
  );
};
