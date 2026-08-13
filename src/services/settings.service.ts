import apiService from "./api.service";

export interface AttendanceSettings {
  workStartTime: string;
  workEndTime: string;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  lateToleranceMinutes: number;
}

class SettingsService {
  private endpoint = "/settings";

  async getSettings(): Promise<AttendanceSettings> {
    const response = await apiService.get<{ settings: AttendanceSettings }>(
      this.endpoint,
    );
    return response.data.settings;
  }

  async updateSettings(
    value: Partial<AttendanceSettings>,
  ): Promise<AttendanceSettings> {
    const response = await apiService.put<{
      settings: AttendanceSettings;
    }>(this.endpoint, value);
    return response.data.settings;
  }

  async resetSettings(): Promise<AttendanceSettings> {
    const response = await apiService.post<{
      settings: AttendanceSettings;
    }>(`${this.endpoint}/reset`);
    return response.data.settings;
  }
}

export default new SettingsService();