import apiService from "./api.service";

export interface Holiday {
  id: string;
  date: string;
  label: string;
  isActive: boolean;
}

class HolidayService {
  private endpoint = "/holidays";

  async getAllHolidays(): Promise<Holiday[]> {
    const response = await apiService.get<{ holidays: Holiday[] }>(
      this.endpoint,
    );
    return response.data.holidays;
  }

  async createHoliday(data: { date: string; label: string }): Promise<Holiday> {
    const response = await apiService.post<{ holiday: Holiday }>(
      this.endpoint,
      data,
    );
    return response.data.holiday;
  }

  async updateHoliday(
    id: string,
    data: Partial<{ date: string; label: string; isActive: boolean }>,
  ): Promise<Holiday> {
    const response = await apiService.put<{ holiday: Holiday }>(
      `${this.endpoint}/${id}`,
      data,
    );
    return response.data.holiday;
  }

  async deleteHoliday(id: string): Promise<void> {
    await apiService.delete(`${this.endpoint}/${id}`);
  }
}

export default new HolidayService();