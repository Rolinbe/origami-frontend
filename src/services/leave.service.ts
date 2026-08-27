import apiService from "./api.service";

export interface LeaveRecord {
  id: number;
  userId: string;
  startDate: string;
  endDate: string;
  type: "leave" | "justified";
  reason?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    service?: { name: string; color: string };
  };
}

class LeaveService {
  private endpoint = "/leaves";

  async getAllLeaves(userId?: string): Promise<LeaveRecord[]> {
    const params = userId ? `?userId=${userId}` : "";
    const response = await apiService.get<{ leaves: LeaveRecord[] }>(
      `${this.endpoint}${params}`
    );
    return response.data.leaves;
  }

  async createLeave(data: {
    userId: string;
    startDate: string;
    endDate: string;
    type: "leave" | "justified";
    reason?: string;
  }): Promise<LeaveRecord> {
    const response = await apiService.post<{ leave: LeaveRecord }>(
      this.endpoint,
      data
    );
    return response.data.leave;
  }

  async deleteLeave(id: number): Promise<void> {
    await apiService.delete(`${this.endpoint}/${id}`);
  }
}

export default new LeaveService();
