export interface Badge {
  id: string;
  badgeId: string;
  userId: string;
  qrCodeData: string;
  qrCodeImage?: string;
  isActive: boolean;
  issuedAt: string;
  revokedAt?: string;
  revokedReason?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: BadgeUser;
}

export interface BadgeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  employeeType: "permanent" | "intern";
  contractStartDate: string;
  contractEndDate?: string;
  profileImage?: string;
  service?: Service;
}

export interface Service {
  id: string;
  name: string;
  code: string;
  color: string;
  description?: string;
}

export interface BadgeFilters {
  search: string;
  status: "all" | "active" | "inactive";
  employeeType: "all" | "permanent" | "intern";
  service: string;
}

export interface BadgeStats {
  total: number;
  active: number;
  revoked: number;
  interns: number;
}

export interface UserWithoutBadge {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  service?: Service;
  employeeType: "permanent" | "intern";
}
