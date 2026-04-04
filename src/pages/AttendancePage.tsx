import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabaseClient';

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
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const todayDate = new Date(now.getTime() - offset).toISOString().split('T')[0];
        if (onNum < 0 || onNum > 35 || offNum < 0 || offNum > 35) {
            setMessage({ text: 'Кількість має бути від 0 до 35', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('attendance_reports')
                .upsert({
                    group_name: user?.group || 'Невідома група',
                    online: onNum,
                    offline: offNum,
                    total: onNum + offNum,
                    date_only: todayDate,
                    submitted_by: user?.username || 'Староста'
                }, {
                    onConflict: 'group_name, date_only'
                });

            if (error) throw error;

            setMessage({
                text: 'Звіт успішно збережено!',
                type: 'success'
            });

            setOnline('');
            setOffline('');
        } catch (err: unknown) {
            console.error(err);
            // Виводимо конкретний текст помилки від Supabase
            const errorMessage = err instanceof Error ? err.message : 'Зверніться до адміна';
            setMessage({
                text: `Помилка: ${errorMessage}`,
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '450px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginBottom: '5px' }}>Відмітка присутніх</h2>
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
                            style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
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
                            style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '12px',
                            background: isSubmitting ? '#94a3b8' : '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            marginTop: '10px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        {isSubmitting ? 'Обробка...' : 'Зберегти звіт'}
                    </button>
                </form>

                {message && (
                    <div style={{
                        marginTop: '15px', padding: '12px', borderRadius: '8px', textAlign: 'center', fontSize: '14px',
                        backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#991b1b',
                        border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};