import { useState, useEffect, useMemo, useCallback } from 'react';
import { ALL_GROUPS } from '../data/groups';
import { supabase } from '../api/supabaseClient';
import * as XLSX from 'xlsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    const [showOnlyMissing, setShowOnlyMissing] = useState(false); // Стан для фільтрації боржників
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchReports(); }, [fetchReports]);

    // --- РОЗШИРЕНА АНАЛІТИКА ---
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

    // --- ЕКСПОРТ ---
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

    // --- МЕТОДИ РЕДАГУВАННЯ ТА ВИДАЛЕННЯ ---
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
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>🏛️ Панель Деканату</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={exportToExcel} style={btnGreen}>Excel</button>
                    <button onClick={downloadPDF} style={btnDark}>PDF Звіт</button>
                </div>
            </div>

            {/* ФІЛЬТРИ */}
            <div className="no-print" style={cardStyle}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={dateRangeBox}>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
                        <span style={{ color: '#64748b' }}>➔</span>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
                    </div>
                    <input type="text" placeholder="🔍 Пошук..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...inputStyle, flex: 1 }} />

                    {/* КНОПКА ТІЛЬКИ БОРЖНИКИ */}
                    <button
                        onClick={() => setShowOnlyMissing(!showOnlyMissing)}
                        style={showOnlyMissing ? btnMissingActive : btnMissing}
                    >
                        {showOnlyMissing ? '🔔 Показати всіх' : '❗ Тільки боржники'}
                    </button>

                    <button onClick={fetchReports} style={btnBlue}>Оновити ↻</button>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[1, 2, 3, 4].map(c => (
                        <button key={c} onClick={() => setSelectedCourse(selectedCourse === c ? null : c)} style={selectedCourse === c ? btnCourseActive : btnCourse}>{c} курс</button>
                    ))}
                </div>
            </div>

            {/* ТІ САМІ КВАДРАТИКИ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={statCard('#3b82f6')}>
                    <span style={statLabel}>Загальна відвідуваність</span>
                    <div style={statValue}>{stats.attendanceRate}%</div>
                    <span style={statSub}>Звітів здано вчасно</span>
                </div>
                <div style={statCard('#10b981')}>
                    <span style={statLabel}>Середньо за день</span>
                    <div style={statValue}>{stats.avgDaily}</div>
                    <span style={statSub}>Студентів на парах</span>
                </div>
                <div style={statCard(stats.diff >= 0 ? '#8b5cf6' : '#ef4444')}>
                    <span style={statLabel}>Динаміка (сьогодні)</span>
                    <div style={statValue}>{stats.diff > 0 ? `+${stats.diff}` : stats.diff}</div>
                    <span style={statSub}>{stats.diffPercent >= 0 ? '📈 Краще' : '📉 Гірше'} на {Math.abs(stats.diffPercent)}%, ніж вчора</span>
                </div>
            </div>

            {/* ГРАФІК */}
            <div className="no-print" style={{ ...cardStyle, height: '250px', padding: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" fontSize={10} tickMargin={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* СПИСКИ ПО ДНЯХ */}
            {isLoading ? <p style={{ textAlign: 'center' }}>Завантаження...</p> : (
                stats.uniqueDates.map(date => (
                    <div key={date} style={{ marginBottom: '40px', pageBreakAfter: 'always' }}>
                        <div style={dateHeader}>📅 Звітність за {date}</div>
                        <div style={tableContainer}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={thStyle}>Група</th>
                                        <th style={thStyle}>Онлайн</th>
                                        <th style={thStyle}>Офлайн</th>
                                        <th style={thStyle}>Всього</th>
                                        <th className="no-print" style={thStyle}>Дії</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ALL_GROUPS
                                        .filter(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .filter(g => selectedCourse ? g.includes(` ${selectedCourse}/`) : true)
                                        .map(group => {
                                            const r = reports.find(rep => rep.group_name === group && rep.date_only === date);

                                            // ЛОГІКА ФІЛЬТРУ: якщо активовано "боржники", приховуємо ті групи, де є звіт
                                            if (showOnlyMissing && r) return null;

                                            return (
                                                <tr key={group + date} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={tdStyle}><strong>{group}</strong></td>
                                                    {r ? (
                                                        <>
                                                            <td style={tdCenter}>{r.online}</td>
                                                            <td style={tdCenter}>{r.offline}</td>
                                                            <td style={{ ...tdCenter, fontWeight: 'bold', color: '#3b82f6' }}>{r.total}</td>
                                                            <td className="no-print" style={tdCenter}>
                                                                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                                    <button onClick={() => handleEdit(r)} style={btnEdit}>✎</button>
                                                                    <button onClick={() => handleDelete(r.id)} style={btnDelete}>🗑️</button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td colSpan={3} style={missingText}>Не здано</td>
                                                            <td className="no-print" style={tdCenter}>
                                                                <button onClick={() => handleAddNew(group, date)} style={btnAdd}>+</button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    div { box-shadow: none !important; margin: 0 !important; }
                }
            `}</style>
        </div>
    );
};

// --- СТИЛІ ---
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' };
const dateRangeBox = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', padding: '5px 10px', borderRadius: '10px' };
const inputStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' };
const statCard = (color: string): React.CSSProperties => ({
    background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: `6px solid ${color}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column'
});
const statLabel = { color: '#64748b', fontSize: '14px', fontWeight: '600' };
const statValue = { fontSize: '36px', fontWeight: '800', color: '#1e293b', margin: '5px 0' };
const statSub = { fontSize: '12px', color: '#94a3b8' };
const btnBlue = { padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const btnGreen = { ...btnBlue, background: '#10b981' };
const btnDark = { ...btnBlue, background: '#1e293b' };
const btnCourse = { padding: '8px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px' };
const btnCourseActive = { ...btnCourse, background: '#3b82f6', color: '#fff', border: 'none' };

// Стилі для кнопки боржників
const btnMissing = { ...btnCourse, border: '1px solid #ef4444', color: '#ef4444', fontWeight: '600' };
const btnMissingActive = { ...btnMissing, background: '#ef4444', color: '#fff' };

const dateHeader = { background: '#1e293b', color: '#fff', padding: '12px 20px', borderRadius: '12px 12px 0 0', fontWeight: 'bold' };
const tableContainer = { background: '#fff', borderRadius: '0 0 12px 12px', overflow: 'hidden', border: '1px solid #e2e8f0' };
const thStyle: React.CSSProperties = { padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b', background: '#f8fafc' };
const tdStyle: React.CSSProperties = { padding: '12px', fontSize: '14px' };
const tdCenter: React.CSSProperties = { padding: '12px', textAlign: 'center', fontSize: '14px' };
const missingText: React.CSSProperties = { padding: '12px', color: '#ef4444', textAlign: 'center', fontStyle: 'italic' };
const btnEdit = { background: '#f59e0b', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' };
const btnDelete = { background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' };
const btnAdd = { background: '#3b82f6', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' };