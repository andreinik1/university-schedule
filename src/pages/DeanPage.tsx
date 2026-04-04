import { useState } from 'react';
import { ALL_GROUPS } from '../data/groups';

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
    const [reports] = useState<IReport[]>(() => {
        const data = localStorage.getItem('attendance_reports');
        return data ? JSON.parse(data) : [];
    });

    // --- СТАТИ ДЛЯ ФІЛЬТРАЦІЇ ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyMissing, setShowOnlyMissing] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
    const [filterDate, setFilterDate] = useState(''); // Нова фільтрація за датою

    // Генеруємо список останніх 7 днів для стрічки
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('uk-UA');
    });

    // Визначаємо, які дні показувати (всі 7 або конкретний обраний)
    const datesToDisplay = filterDate 
        ? [new Date(filterDate).toLocaleDateString('uk-UA')] 
        : last7Days;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ marginBottom: '30px', textAlign: 'center', color: '#1e293b' }}>Моніторинг відвідуваності</h1>

            {/* --- ПАНЕЛЬ ФІЛЬТРІВ --- */}
            <div style={{ 
                background: '#fff', padding: '20px', borderRadius: '15px', 
                border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px'
            }}>
                {/* 1. Пошук */}
                <input 
                    type="text" 
                    placeholder="🔍 Пошук групи..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: '1', minWidth: '200px' }}
                />

                {/* 2. Фільтр по даті */}
                <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#475569' }}
                />

                {/* 3. Кнопки курсів */}
                <div style={{ display: 'flex', gap: '5px' }}>
                    {[1, 2, 3, 4].map(course => (
                        <button 
                            key={course}
                            onClick={() => setSelectedCourse(selectedCourse === course ? null : course)}
                            style={{ 
                                padding: '10px 15px', borderRadius: '8px', cursor: 'pointer',
                                border: '1px solid #007bff',
                                background: selectedCourse === course ? '#007bff' : '#fff',
                                color: selectedCourse === course ? '#fff' : '#007bff',
                                fontWeight: '600', transition: '0.2s'
                            }}
                        >
                            {course} курс
                        </button>
                    ))}
                </div>

                {/* 4. Тільки боржники */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>
                    <input 
                        type="checkbox" 
                        checked={showOnlyMissing} 
                        onChange={() => setShowOnlyMissing(!showOnlyMissing)}
                        style={{ width: '20px', height: '20px' }}
                    />
                    Тільки боржники
                </label>
            </div>

            {/* --- РЕНДЕР СТРІЧКИ --- */}
            {datesToDisplay.map(currentDate => {
                // 1. Фільтруємо групи за пошуком та курсом
                const filteredGroups = ALL_GROUPS.filter(group => {
                    const matchesSearch = group.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCourse = selectedCourse ? group.includes(` ${selectedCourse}/`) : true;
                    return matchesSearch && matchesCourse;
                });

                // 2. Отримуємо звіти за цей конкретний день
                const dayReports = reports.filter(r => r.dateOnly === currentDate);
                
                // 3. Якщо увімкнено "Тільки боржники", залишаємо групи без звітів
                const finalGroups = showOnlyMissing 
                    ? filteredGroups.filter(g => !dayReports.some(r => r.group === g))
                    : filteredGroups;

                // Якщо після всіх фільтрів нічого показувати в цей день — пропускаємо дату
                if (finalGroups.length === 0) return null;

                return (
                    <div key={currentDate} style={{ marginBottom: '50px' }}>
                        <h3 style={{
                            background: '#f1f5f9',
                            padding: '12px 15px',
                            borderRadius: '10px',
                            color: '#334155',
                            borderLeft: '5px solid #007bff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <span>📅 Дата: <strong>{currentDate}</strong></span>
                                {currentDate === new Date().toLocaleDateString('uk-UA') &&
                                    <span style={{ marginLeft: '10px', fontSize: '11px', background: '#007bff', color: '#fff', padding: '3px 8px', borderRadius: '4px' }}>СЬОГОДНІ</span>
                                }
                            </div>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>
                                Здано: <strong>{dayReports.length}</strong> з {ALL_GROUPS.length}
                            </span>
                        </h3>

                        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f8fafc' }}>
                                    <tr>
                                        <th style={{ padding: '12px 15px', borderBottom: '1.5px solid #e2e8f0', width: '25%' }}>Група</th>
                                        <th style={{ padding: '12px 15px', borderBottom: '1.5px solid #e2e8f0' }}>Онлайн</th>
                                        <th style={{ padding: '12px 15px', borderBottom: '1.5px solid #e2e8f0' }}>Офлайн</th>
                                        <th style={{ padding: '12px 15px', borderBottom: '1.5px solid #e2e8f0' }}>Всього</th>
                                        <th style={{ padding: '12px 15px', borderBottom: '1.5px solid #e2e8f0' }}>Статус / Час</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {finalGroups.map((groupName) => {
                                        const report = dayReports.find(r => r.group === groupName);

                                        return (
                                            <tr key={`${currentDate}-${groupName}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 15px' }}><strong>{groupName}</strong></td>
                                                {report ? (
                                                    <>
                                                        <td style={{ padding: '12px 15px' }}>{report.online}</td>
                                                        <td style={{ padding: '12px 15px' }}>{report.offline}</td>
                                                        <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#007bff' }}>{report.total}</td>
                                                        <td style={{ padding: '12px 15px', fontSize: '12px', color: '#94a3b8' }}>{report.fullTime}</td>
                                                    </>
                                                ) : (
                                                    <td colSpan={4} style={{ padding: '12px 15px', color: '#ef4444', fontStyle: 'italic', fontSize: '14px', fontWeight: '500' }}>
                                                         Не здано
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            {/* Якщо вибрано дату, за яку взагалі немає даних */}
            {datesToDisplay.every(d => !reports.some(r => r.dateOnly === d)) && filterDate && (
                <div style={{ textAlign: 'center', padding: '50px', color: '#64748b', background: '#f8fafc', borderRadius: '15px' }}>
                    За обрану дату {new Date(filterDate).toLocaleDateString('uk-UA')} звітів не знайдено.
                </div>
            )}
        </div>
    );
};