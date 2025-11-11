import { Edit, Trash2, Building2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    code: string;
    description: string;
    color: string;
    isActive: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

export const ServiceCard = ({ service, onEdit, onDelete, onToggleActive }: ServiceCardProps) => {
  return (
    <Card className={`relative overflow-hidden ${!service.isActive ? 'opacity-60' : ''}`}>
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: service.isActive ? service.color : '#d1d5db' }}
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ 
                backgroundColor: service.isActive ? service.color : '#d1d5db',
                color: service.isActive ? 'white' : '#6b7280'
              }}
            >
              {service.code}
            </div>
            <div>
              <CardTitle className={`text-lg ${!service.isActive ? 'text-gray-600' : ''}`}>
                {service.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Code: {service.code}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive}>
                <Building2 className="mr-2 h-4 w-4" />
                {service.isActive ? 'Désactiver' : 'Activer'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {service.description}
        </p>
      </CardContent>
    </Card>
  );
};