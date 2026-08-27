import apiService from "./api.service";

export interface AuditLogEntry {
  id: number;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    service?: { name: string; color: string };
  };
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class AuditLogService {
  private endpoint = "/audit-logs";

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}): Promise<AuditLogsResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.action) query.set("action", params.action);
    if (params.entity) query.set("entity", params.entity);
    if (params.userId) query.set("userId", params.userId);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.search) query.set("search", params.search);

    const qs = query.toString();
    const response = await apiService.get<AuditLogsResponse>(
      `${this.endpoint}${qs ? `?${qs}` : ""}`
    );
    return response.data;
  }
}

export default new AuditLogService();
