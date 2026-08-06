import { useState, useEffect, useMemo, useCallback } from 'react';
import { ALL_GROUPS } from '../../data/groups';
import { supabase } from '../../api/supabaseClient';
import * as XLSX from 'xlsx';
import { DeanFilters } from './components/DeanFilters';
import { DeanStats } from './components/DeanStats';
import { DeanChart } from './components/DeanChart';
import { AttendanceTable } from './components/AttendanceTable';
import styles from './DeanPage.module.scss';

interface IReport {
    id: number;
    group_name: string;
    online: number;
    offline: number;
    total: number;
    date_only: string;
}

export const DeanPage = () => {
    const [reports, setReports] = useState<IReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyMissing, setShowOnlyMissing] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('attendance_reports')
            .select('*')
            .gte('date_only', startDate)
            .lte('date_only', endDate)
            .order('date_only', { ascending: false });

        if (!error) setReports(data || []);
        setIsLoading(false);
    }, [startDate, endDate]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const stats = useMemo(() => {
        const uniqueDates = Array.from(new Set(reports.map(r => r.date_only))).sort();

        const chartMap = uniqueDates.map(date => ({
            date,
            total: reports.filter(r => r.date_only === date).reduce((acc, r) => acc + r.total, 0)
        }));

        const totalStudents = reports.reduce((acc, r) => acc + r.total, 0);
        const avgDaily = uniqueDates.length > 0 ? Math.round(totalStudents / uniqueDates.length) : 0;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = uniqueDates.filter(d => d < today).reverse()[0];

        const todayTotal = reports.filter(r => r.date_only === today).reduce((acc, r) => acc + r.total, 0);
        const yesterdayTotal = reports.filter(r => r.date_only === yesterday).reduce((acc, r) => acc + r.total, 0);

        const diff = todayTotal - yesterdayTotal;
        const diffPercent = yesterdayTotal > 0 ? Math.round((diff / yesterdayTotal) * 100) : 0;

        const attendanceRate = Math.round((reports.length / (ALL_GROUPS.length * (uniqueDates.length || 1))) * 100) || 0;

        return {
            attendanceRate,
            avgDaily,
            diff,
            diffPercent,
            chartData: chartMap,
            uniqueDates: uniqueDates.reverse()
        };
    }, [reports]);

    const exportToExcel = () => {
        const fullData: Record<string, string | number>[] = [];
        stats.uniqueDates.forEach(date => {
            ALL_GROUPS.forEach(group => {
                const r = reports.find(rep => rep.group_name === group && rep.date_only === date);
                fullData.push({
                    "Дата": date,
                    "Група": group,
                    "Онлайн": r ? r.online : 0,
                    "Офлайн": r ? r.offline : 0,
                    "Всього": r ? r.total : 0,
                    "Статус": r ? "Здано" : "Не здано"
                });
            });
            fullData.push({});
        });

        const ws = XLSX.utils.json_to_sheet(fullData);
        ws['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Звіт по відвідуваності");
        XLSX.writeFile(wb, `Full_Report_${startDate}_${endDate}.xlsx`);
    };

    const downloadPDF = () => window.print();

    const handleEdit = async (report: IReport) => {
        const on = parseInt(prompt("Онлайн:", report.online.toString()) || "0");
        const off = parseInt(prompt("Офлайн:", report.offline.toString()) || "0");
        await supabase.from('attendance_reports').update({ online: on, offline: off, total: on + off }).eq('id', report.id);
        fetchReports();
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Видалити цей звіт?")) {
            await supabase.from('attendance_reports').delete().eq('id', id);
            fetchReports();
        }
    };

    const handleAddNew = async (groupName: string, date: string) => {
        const on = parseInt(prompt(`Група ${groupName}. Онлайн:`, "0") || "0");
        const off = parseInt(prompt(`Офлайн:`, "0") || "0");
        await supabase.from('attendance_reports').insert([{
            group_name: groupName, online: on, offline: off, total: on + off, date_only: date, submitted_by: 'Деканат'
        }]);
        fetchReports();
    };

    return (
        <div className={styles.deanPage}>
            <div className={`${styles.topBar} no-print`}>
                <h1>🏛️ Панель Деканату</h1>
                <div className={styles.btnGroup}>
                    <button onClick={exportToExcel} className={styles.btnGreen}>Excel</button>
                    <button onClick={downloadPDF} className={styles.btnDark}>PDF Звіт</button>
                </div>
            </div>

            <DeanFilters
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showOnlyMissing={showOnlyMissing}
                setShowOnlyMissing={setShowOnlyMissing}
                selectedCourse={selectedCourse}
                setSelectedCourse={setSelectedCourse}
                fetchReports={fetchReports}
            />

            <DeanStats stats={stats} />

            <DeanChart chartData={stats.chartData} />

            {isLoading ? (
                <p style={{ textAlign: 'center' }}>Завантаження...</p>
            ) : (
                stats.uniqueDates.map(date => (
                    <AttendanceTable
                        key={date}
                        date={date}
                        reports={reports}
                        searchTerm={searchTerm}
                        selectedCourse={selectedCourse}
                        showOnlyMissing={showOnlyMissing}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleAddNew={handleAddNew}
                    />
                ))
            )}
        </div>
    );
};
