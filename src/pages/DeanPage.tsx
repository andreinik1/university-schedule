import { useState, useEffect } from 'react';
import { ALL_GROUPS, translateGroupName } from '../data/groups';
import { supabase } from '../api/supabaseClient';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IReport {
    id: number;
    group_name: string;
    online: number;
    offline: number;
    total: number;
    date_only: string;
    full_time: string;
}

export const DeanPage = () => {
    const [reports, setReports] = useState<IReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyMissing, setShowOnlyMissing] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

    const [filterDate, setFilterDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const activeDateStr = new Date(filterDate).toLocaleDateString('uk-UA');

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('attendance_reports')
                .select('*')
                .eq('date_only', activeDateStr);

            if (error) throw error;
            setReports(data || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filterDate]);

    const handleDelete = async (id: number, groupName: string) => {
        if (window.confirm(`Видалити звіт групи ${groupName}?`)) {
            const { error } = await supabase.from('attendance_reports').delete().eq('id', id);
            if (!error) fetchReports();
        }
    };

    const handleEdit = async (report: IReport) => {
        const newOnline = prompt("Кількість ОНЛАЙН:", report.online.toString());
        const newOffline = prompt("Кількість ОФЛАЙН:", report.offline.toString());
        if (newOnline !== null && newOffline !== null) {
            const on = parseInt(newOnline) || 0;
            const off = parseInt(newOffline) || 0;
            const { error } = await supabase
                .from('attendance_reports')
                .update({ online: on, offline: off, total: on + off })
                .eq('id', report.id);
            if (!error) fetchReports();
        }
    };

    // --- ФУНКЦІЇ ЕКСПОРТУ ---
    const exportToExcel = () => {
        const dataToExport = ALL_GROUPS.map(group => {
            const r = reports.find(rep => rep.group_name === group);
            return {
                "Дата": activeDateStr,
                "Група": group,
                "Онлайн": r ? r.online : "0",
                "Офлайн": r ? r.offline : "0",
                "Всього": r ? r.total : "0",
                "Статус": r ? "Здано" : "Відсутній"
            };
        });
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Report_${activeDateStr}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text(`Attendance Report - ${activeDateStr}`, 14, 15);

        const tableData = ALL_GROUPS.map(group => {
            const r = reports.find(rep => rep.group_name === group);
            return [
                translateGroupName(group),
                r ? r.online.toString() : "0",
                r ? r.offline.toString() : "0",
                r ? r.total.toString() : "0",
                r ? "OK" : "Missing"
            ];
        });

        autoTable(doc, {
            head: [['Group', 'Online', 'Offline', 'Total', 'Status']],
            body: tableData,
            startY: 25,
            headStyles: { fillColor: [0, 123, 255] }
        });
        doc.save(`Report_${activeDateStr}.pdf`);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1150px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Деканат (Cloud DB)</h1>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                    <input
                        type="text" placeholder="🔍 Пошук групи..." value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: '1' }}
                    />
                    <input
                        type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}
                    />
                    <button onClick={fetchReports} style={{ padding: '10px 15px', borderRadius: '8px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        Оновити ↻
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3, 4].map(c => (
                            <button key={c} onClick={() => setSelectedCourse(selectedCourse === c ? null : c)}
                                style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #007bff', background: selectedCourse === c ? '#007bff' : '#fff', color: selectedCourse === c ? '#fff' : '#007bff' }}>
                                {c} курс
                            </button>
                        ))}
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>
                        <input type="checkbox" checked={showOnlyMissing} onChange={() => setShowOnlyMissing(!showOnlyMissing)} />
                        Тільки боржники
                    </label>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={exportToExcel} style={{ padding: '10px 15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Excel 📊</button>
                        <button onClick={exportToPDF} style={{ padding: '10px 15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>PDF 📄</button>
                    </div>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {isLoading ? (
                    <p style={{ padding: '20px', textAlign: 'center' }}>Синхронізація з базою...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Група</th>
                                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Онлайн</th>
                                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Офлайн</th>
                                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Всього</th>
                                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ALL_GROUPS
                                .filter(g => {
                                    const matchesSearch = g.toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesCourse = selectedCourse ? g.includes(` ${selectedCourse}/`) : true;
                                    return matchesSearch && matchesCourse;
                                })
                                .map(group => {
                                    const r = reports.find(rep => rep.group_name === group);
                                    if (showOnlyMissing && r) return null;

                                    return (
                                        <tr key={group} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '15px' }}><strong>{group}</strong></td>
                                            {r ? (
                                                <>
                                                    <td style={{ textAlign: 'center' }}>{r.online}</td>
                                                    <td style={{ textAlign: 'center' }}>{r.offline}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#007bff' }}>{r.total}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button onClick={() => handleEdit(r)} style={{ marginRight: '8px', background: '#f59e0b', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>✎</button>
                                                        <button onClick={() => handleDelete(r.id, group)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                                                    </td>
                                                </>
                                            ) : (
                                                <td colSpan={4} style={{ padding: '15px', color: '#ef4444', textAlign: 'center', fontStyle: 'italic' }}>Не здано</td>
                                            )}
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};