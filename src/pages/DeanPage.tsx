import { useState, useEffect } from 'react';
import { ALL_GROUPS, translateGroupName } from '../data/groups';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface IReport {
    id: number;
    group: string;
    online: number;
    offline: number;
    total: number;
    dateOnly: string;
    fullTime: string;
}

export const DeanPage = () => {
    // Змінюємо на динамічний стан для можливості редагування
    const [reports, setReports] = useState<IReport[]>(() => {
        const data = localStorage.getItem('attendance_reports');
        return data ? JSON.parse(data) : [];
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyMissing, setShowOnlyMissing] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

    const [filterDate, setFilterDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    const activeDate = new Date(filterDate).toLocaleDateString('uk-UA');

    // Синхронізація змін з localStorage
    useEffect(() => {
        localStorage.setItem('attendance_reports', JSON.stringify(reports));
    }, [reports]);

    // --- ФУНКЦІЯ ВИДАЛЕННЯ (ОЧИЩЕННЯ) ---
    const handleDelete = (groupName: string) => {
        if (window.confirm(`Ви впевнені, що хочете видалити звіт для групи ${groupName} за ${activeDate}?`)) {
            const updatedReports = reports.filter(r => !(r.group === groupName && r.dateOnly === activeDate));
            setReports(updatedReports);
        }
    };

    // --- ФУНКЦІЯ РЕДАГУВАННЯ ---
    const handleEdit = (groupName: string) => {
        const report = reports.find(r => r.group === groupName && r.dateOnly === activeDate);
        if (!report) return;

        const newOnline = prompt("Введіть кількість ОНЛАЙН:", report.online.toString());
        const newOffline = prompt("Введіть кількість ОФЛАЙН:", report.offline.toString());

        if (newOnline !== null && newOffline !== null) {
            const onlineNum = parseInt(newOnline) || 0;
            const offlineNum = parseInt(newOffline) || 0;

            const updatedReports = reports.map(r => {
                if (r.group === groupName && r.dateOnly === activeDate) {
                    return {
                        ...r,
                        online: onlineNum,
                        offline: offlineNum,
                        total: onlineNum + offlineNum,
                        fullTime: `${activeDate}, ${new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })} (ред.)`
                    };
                }
                return r;
            });
            setReports(updatedReports);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setShowOnlyMissing(false);
        setSelectedCourse(null);
        setFilterDate(new Date().toISOString().split('T')[0]);
    };

    const exportToExcel = () => {
        const dayReports = reports.filter(r => r.dateOnly === activeDate);
        const dataToExport = ALL_GROUPS.map(group => {
            const r = dayReports.find(rep => rep.group === group);
            return {
                "Дата": activeDate,
                "Група": group,
                "Онлайн": r ? r.online : "0",
                "Офлайн": r ? r.offline : "0",
                "Всього": r ? r.total : "0"
            };
        });
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Report_${activeDate}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text(`Attendance Report - ${activeDate}`, 14, 15);
        const dayReports = reports.filter(r => r.dateOnly === activeDate);
        const tableData = ALL_GROUPS.map(group => {
            const r = dayReports.find(rep => rep.group === group);
            return [translateGroupName(group), r ? r.online.toString() : "0", r ? r.offline.toString() : "0", r ? r.total.toString() : "0", r ? "OK" : "Missing"];
        });
        autoTable(doc, {
            head: [['Group', 'Online', 'Offline', 'Total', 'Status']],
            body: tableData,
            startY: 25,
            styles: { font: 'helvetica', fontSize: 10 },
            headStyles: { fillColor: [0, 123, 255] }
        });
        doc.save(`Report_${activeDate}.pdf`);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1150px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Панель керування деканату</h1>

            {/* ПАНЕЛЬ ФІЛЬТРІВ */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
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
                    <button onClick={clearFilters} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #64748b', background: '#f8fafc', cursor: 'pointer' }}>
                        Скинути
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
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

            {/* ТАБЛИЦЯ */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Група</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Онлайн</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Офлайн</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Всього</th>
                            <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0' }}>Час звіту</th>
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
                                const r = reports.find(rep => rep.group === group && rep.dateOnly === activeDate);
                                if (showOnlyMissing && r) return null;

                                return (
                                    <tr key={group} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px' }}><strong>{group}</strong></td>
                                        {r ? (
                                            <>
                                                <td style={{ textAlign: 'center' }}>{r.online}</td>
                                                <td style={{ textAlign: 'center' }}>{r.offline}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#007bff' }}>{r.total}</td>
                                                <td style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>{r.fullTime.split(', ')[1]}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button onClick={() => handleEdit(group)} style={{ marginRight: '8px', background: '#f59e0b', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>✎</button>
                                                    <button onClick={() => handleDelete(group)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                                                </td>
                                            </>
                                        ) : (
                                            <td colSpan={5} style={{ padding: '15px', color: '#ef4444', fontStyle: 'italic', textAlign: 'center' }}>Не здано</td>
                                        )}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};