import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabaseClient'; // Імпортуємо клієнт

export const AttendancePage = () => {
    const { user } = useAuth();
    const [online, setOnline] = useState('');
    const [offline, setOffline] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const onNum = parseInt(online) || 0;
        const offNum = parseInt(offline) || 0;
        const todayDate = new Date().toLocaleDateString('uk-UA');

        if (onNum < 0 || onNum > 35 || offNum < 0 || offNum > 35) {
            setMessage({ text: 'Кількість має быть від 0 до 35', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Використовуємо upsert для автоматичного оновлення звіту, якщо група і дата збігаються
            // Для цього в Supabase має бути налаштований унікальний індекс (Constraint) 
            // або ми просто шукаємо запис вручну:

            const { data: existing } = await supabase
                .from('attendance_reports')
                .select('id')
                .eq('group_name', user?.group)
                .eq('date_only', todayDate)
                .single();

            const reportData = {
                group_name: user?.group || 'Невідома група',
                online: onNum,
                offline: offNum,
                total: onNum + offNum,
                date_only: todayDate,
                submitted_by: user?.username
            };

            let error;
            if (existing) {
                // Оновлюємо
                const { error: updateError } = await supabase
                    .from('attendance_reports')
                    .update(reportData)
                    .eq('id', existing.id);
                error = updateError;
            } else {
                // Створюємо новий
                const { error: insertError } = await supabase
                    .from('attendance_reports')
                    .insert([reportData]);
                error = insertError;
            }

            if (error) throw error;

            setMessage({ text: existing ? 'Звіт оновлено в базі!' : 'Звіт надіслано в базу!', type: 'success' });
            setOnline('');
            setOffline('');
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Помилка підключення до бази даних', type: 'error' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '450px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ marginBottom: '5px' }}>Відмітка присутніх (DB)</h2>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Група: <strong>{user?.group}</strong></p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Кількість Онлайн:</label>
                        <input
                            type="number"
                            required
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
                            value={offline}
                            onChange={(e) => setOffline(e.target.value.replace(/\D/g, ''))}
                            placeholder="0-35"
                            style={{ width: '94%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '12px',
                            background: isSubmitting ? '#ccc' : '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSubmitting ? 'Надсилання...' : 'Надіслати звіт'}
                    </button>
                </form>

                {message && (
                    <div style={{
                        marginTop: '15px', padding: '10px', borderRadius: '8px', textAlign: 'center',
                        backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#991b1b'
                    }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};