import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AttendanceReport {
    id: number;
    group: string;
    online: number;
    offline: number;
    total: number;
    dateOnly: string;
    fullTime: string;
    submittedBy?: string;
}

export const AttendancePage = () => {
    const { user } = useAuth();
    const [online, setOnline] = useState('');
    const [offline, setOffline] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const onNum = parseInt(online);
        const offNum = parseInt(offline);
        const todayDate = new Date().toLocaleDateString('uk-UA'); // Ключ для перевірки дня

        if (onNum < 0 || onNum > 35 || offNum < 0 || offNum > 35) {
            setMessage({ text: 'Кількість має бути від 0 до 35', type: 'error' });
            return;
        }

        const reports: AttendanceReport[] = JSON.parse(localStorage.getItem('attendance_reports') || '[]') as AttendanceReport[];
        
        // Шукаємо, чи вже є звіт від цієї групи за СЬОГОДНІ
        const existingIndex = reports.findIndex((r) => 
            r.group === user?.group && r.dateOnly === todayDate
        );

        const newReport = {
            id: existingIndex !== -1 ? reports[existingIndex].id : Date.now(),
            group: user?.group || 'Невідома група',
            online: onNum,
            offline: offNum,
            total: onNum + offNum,
            dateOnly: todayDate, // Потрібно для групування в деканаті
            fullTime: new Date().toLocaleTimeString('uk-UA'), // Час останнього оновлення
            submittedBy: user?.username
        };

        if (existingIndex !== -1) {
            // Оновлюємо існуючий запис
            reports[existingIndex] = newReport;
        } else {
            // Додаємо новий на початок масиву
            reports.unshift(newReport);
        }

        localStorage.setItem('attendance_reports', JSON.stringify(reports));

        setMessage({ text: existingIndex !== -1 ? 'Звіт оновлено!' : 'Звіт надіслано!', type: 'success' });
        setOnline('');
        setOffline('');
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '450px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginBottom: '5px' }}>Відмітка присутніх</h2>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Група: <strong>{user?.group}</strong></p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Кількість Онлайн:</label>
                        <input
                            type="number"
                            required
                            value={online}
                            onChange={(e) => setOnline(e.target.value.replace(/\D/g, ''))}
                            placeholder="0-35"
                            style={{ width: '94%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Кількість Офлайн:</label>
                        <input
                            type="number"
                            required
                            value={offline}
                            onChange={(e) => setOffline(e.target.value.replace(/\D/g, ''))}
                            placeholder="0-35"
                            style={{ width: '94%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Надіслати звіт
                    </button>
                </form>

                {message && (
                    <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', textAlign: 'center', 
                        backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#991b1b' }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};