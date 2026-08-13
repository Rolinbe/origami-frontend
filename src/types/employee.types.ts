export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  serviceId?: string;
  employeeType: "permanent" | "intern";
  contractStartDate: string;
  contractEndDate?: string;
  isActive: boolean;
  profileImage?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  service?: Service;
  attendances?: Attendance[];
}

export interface Service {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface Attendance {
  id: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: string;
}

export interface EmployeeFilters {
  search: string;
  status: "all" | "active" | "inactive";
  employeeType: "all" | "permanent" | "intern";
  service: string;
}

export interface EmployeeListResponse {
  employees: Employee[];
  totalPages: number;
  currentPage: number;
  totalEmployees: number;
}

export interface EmployeeUpdateData {
  isActive?: boolean;
  serviceId?: string;
  position?: string;
  department?: string;
  employeeType?: "permanent" | "intern";
  contractStartDate?: string;
  contractEndDate?: string;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  serviceId?: string;
  employeeType: "permanent" | "intern";
  contractStartDate: string;
  contractEndDate?: string;
  profileImage?: string;
}
