import { supabase } from './supabaseClient';

export const attendanceApi = {
  // Отправить новый згвіт
  async sendReport(report: { 
    group: string, 
    online: number, 
    offline: number, 
    total: number, 
    dateOnly: string 
  }) {
    const { data, error } = await supabase
      .from('attendance_reports')
      .insert([{
        group_name: report.group,
        online: report.online,
        offline: report.offline,
        total: report.total,
        date_only: report.dateOnly
      }]);
    
    if (error) throw error;
    return data;
  },

  // Получить все отчеты за конкретную дату (для деканата)
  async getReportsByDate(date: string) {
    const { data, error } = await supabase
      .from('attendance_reports')
      .select('*')
      .eq('date_only', date);
    
    if (error) throw error;
    return data;
  }
};