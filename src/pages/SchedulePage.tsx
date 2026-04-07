import { useState, useEffect } from 'react';
import { ScheduleList } from '../components/schedule/ScheduleList';
import { supabase } from '../api/supabaseClient';
import type { IScheduleItem } from '../types/schedule';

const DAYS = [
    { id: 'monday', label: 'Пн' },
    { id: 'tuesday', label: 'Вт' },
    { id: 'wednesday', label: 'Ср' },
    { id: 'thursday', label: 'Чт' },
    { id: 'friday', label: 'Пт' },
];

const getInitialDay = () => {
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = new Date().getDay();
    const todayName = daysMap[todayIndex];
    if (todayName === 'sunday' || todayName === 'saturday') return 'monday';
    return todayName;
};

export const SchedulePage = () => {
    const [allGroups, setAllGroups] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>(localStorage.getItem('lastSelectedGroup') || "");
    const [selectedDay, setSelectedDay] = useState(getInitialDay());
    const [weekType, setWeekType] = useState<'numerator' | 'denominator'>('numerator');
    const [dbSchedule, setDbSchedule] = useState<IScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            const { data, error } = await supabase.from('schedule').select('group_name');
            if (!error && data) {
                const uniqueGroups = Array.from(new Set(data.map(item => item.group_name))).sort();
                setAllGroups(uniqueGroups);
                if (!selectedGroup && uniqueGroups.length > 0) setSelectedGroup(uniqueGroups[0]);
            }
        };
        fetchGroups();
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!selectedGroup) return;
            setLoading(true);
            localStorage.setItem('lastSelectedGroup', selectedGroup);
            const { data, error } = await supabase
                .from('schedule')
                .select('*')
                .eq('group_name', selectedGroup);
            if (!error) setDbSchedule(data || []);
            setLoading(false);
        };
        fetchSchedule();
    }, [selectedGroup]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <header style={{ marginBottom: '20px' }}>
                <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                >
                    {allGroups.length === 0 && <option>Завантаження груп...</option>}
                    {allGroups.map(group => <option key={group} value={group}>{group}</option>)}
                </select>

                <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '15px' }}>
                    {(['numerator', 'denominator'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setWeekType(type)}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                backgroundColor: weekType === type ? '#fff' : 'transparent',
                                color: weekType === type ? '#0f172a' : '#64748b',
                                boxShadow: weekType === type ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {type === 'numerator' ? 'Чисельник' : 'Знаменник'}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    {DAYS.map(day => (
                        <button
                            key={day.id}
                            onClick={() => setSelectedDay(day.id)}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: '600',
                                backgroundColor: selectedDay === day.id ? '#007bff' : '#fff',
                                color: selectedDay === day.id ? '#fff' : '#475569',
                                cursor: 'pointer'
                            }}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Отримуємо розклад...</div>
            ) : (
                <ScheduleList
                    data={dbSchedule}
                    day={selectedDay}
                    weekType={weekType}
                />
            )}
        </div>
    );
};