import { useState, useEffect } from 'react';
import { ScheduleList } from '../components/schedule/ScheduleList';
import { GROUPS_DATA } from '../data/schedule';

const DAYS = [
    { id: 'monday', label: 'Пн' },
    { id: 'tuesday', label: 'Вт' },
    { id: 'wednesday', label: 'Ср' },
    { id: 'thursday', label: 'Чт' },
    { id: 'friday', label: 'Пт' },
];

// Допоміжна функція для визначення реального дня
const getInitialDay = () => {
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = new Date().getDay();
    const todayName = daysMap[todayIndex];

    // Якщо сьогодні вихідний (неділя або субота), повертаємо понеділок
    if (todayName === 'sunday' || todayName === 'saturday') {
        return 'monday';
    }
    return todayName;
};

export const SchedulePage = () => {
    // 1. Стан групи: ініціалізуємо з localStorage або беремо першу з масиву
    const [selectedGroup, setSelectedGroup] = useState(() => {
        return localStorage.getItem('lastSelectedGroup') || Object.keys(GROUPS_DATA)[0];
    });

    // 2. Стан дня: ініціалізуємо реальним днем
    const [selectedDay, setSelectedDay] = useState(getInitialDay());
    const [weekType, setWeekType] = useState<'numerator' | 'denominator'>('numerator');

    // 3. Зберігаємо вибрану групу в localStorage при кожній зміні
    useEffect(() => {
        localStorage.setItem('lastSelectedGroup', selectedGroup);
    }, [selectedGroup]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <header style={{ marginBottom: '20px' }}>
                {/* Селектор групи */}
                <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        borderRadius: '10px', 
                        marginBottom: '15px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                        backgroundColor: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    {Object.keys(GROUPS_DATA).map(group => (
                        <option key={group} value={group}>{group}</option>
                    ))}
                </select>

                {/* Перемикач чисельник / знаменник */}
                <div style={{ 
                    display: 'flex', 
                    backgroundColor: '#f1f5f9', 
                    padding: '4px', 
                    borderRadius: '10px', 
                    marginBottom: '15px' 
                }}>
                    <button
                        onClick={() => setWeekType('numerator')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            backgroundColor: weekType === 'numerator' ? '#fff' : 'transparent',
                            color: weekType === 'numerator' ? '#0f172a' : '#64748b',
                            boxShadow: weekType === 'numerator' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Чисельник
                    </button>
                    <button
                        onClick={() => setWeekType('denominator')}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            backgroundColor: weekType === 'denominator' ? '#fff' : 'transparent',
                            color: weekType === 'denominator' ? '#0f172a' : '#64748b',
                            boxShadow: weekType === 'denominator' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Знаменник
                    </button>
                </div>

                {/* Перемикач днів */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    {DAYS.map(day => (
                        <button
                            key={day.id}
                            onClick={() => setSelectedDay(day.id)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                fontWeight: '600',
                                backgroundColor: selectedDay === day.id ? '#007bff' : '#fff',
                                color: selectedDay === day.id ? '#fff' : '#475569',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {day.label}
                        </button>
                    ))}
                </div>
            </header>

            <ScheduleList 
                groupName={selectedGroup} 
                day={selectedDay} 
                weekType={weekType} 
            />
        </div>
    );
};