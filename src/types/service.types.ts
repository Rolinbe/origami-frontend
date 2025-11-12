export interface Service {
  id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  stats?: ServiceStats;
  employees?: Employee[];
}

export interface ServiceStats {
  totalEmployees: number;
  permanentCount: number;
  internCount: number;
  presentToday: number;
  absentToday: number;
  attendanceRate?: number;
  lateThisMonth?: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  employeeType: "permanent" | "intern";
  profileImage?: string;
}

export interface ServiceFormData {
  name: string;
  code: string;
  description?: string;
  color: string;
  isActive?: boolean;
}
