import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../api/supabaseClient';
import styles from './AttendancePage.module.scss';

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
        <div className={styles.attendancePage}>
            <div className={styles.card}>
                <h2 className={styles.title}>Відмітка присутніх</h2>
                <p className={styles.groupInfo}>Група: <strong>{user?.group}</strong></p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Кількість Онлайн:</label>
                        <input
                            type="number"
                            required
                            disabled={isSubmitting}
                            value={online}
                            onChange={(e) => setOnline(e.target.value.replace(/\D/g, ''))}
                            placeholder="0-35"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Кількість Офлайн:</label>
                        <input
                            type="number"
                            required
                            disabled={isSubmitting}
                            value={offline}
                            onChange={(e) => setOffline(e.target.value.replace(/\D/g, ''))}
                            placeholder="0-35"
                            className={styles.input}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitBtn}
                    >
                        {isSubmitting ? 'Обробка...' : 'Зберегти звіт'}
                    </button>
                </form>

                {message && (
                    <div className={message.type === 'success' ? styles.messageSuccess : styles.messageError}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};
