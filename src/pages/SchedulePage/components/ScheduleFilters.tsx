import React from 'react';

interface DayConfig {
    id: string;
    label: string;
}

interface ScheduleFiltersProps {
    days: DayConfig[];
    selectedGroup: string;
    setSelectedGroup: (g: string) => void;
    allGroups: string[];
    weekType: 'numerator' | 'denominator';
    setWeekType: (type: 'numerator' | 'denominator') => void;
    selectedDay: string;
    setSelectedDay: (day: string) => void;
    styles: Record<string, string>;
}

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
    days,
    selectedGroup,
    setSelectedGroup,
    allGroups,
    weekType,
    setWeekType,
    selectedDay,
    setSelectedDay,
    styles
}) => {
    return (
        <header className={styles.header}>
            <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={styles.selectGroup}
            >
                {allGroups.length === 0 && <option>Завантаження груп...</option>}
                {allGroups.map(group => (
                    <option key={group} value={group}>
                        {group}
                    </option>
                ))}
            </select>

            <div className={styles.weekTypeSelector}>
                {(['numerator', 'denominator'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setWeekType(type)}
                        className={`${styles.weekTypeBtn} ${weekType === type ? styles.active : ''}`}
                    >
                        {type === 'numerator' ? 'Чисельник' : 'Знаменник'}
                    </button>
                ))}
            </div>

            <div className={styles.daysSelector}>
                {days.map(day => (
                    <button
                        key={day.id}
                        onClick={() => setSelectedDay(day.id)}
                        className={`${styles.dayBtn} ${selectedDay === day.id ? styles.active : ''}`}
                    >
                        {day.label}
                    </button>
                ))}
            </div>
        </header>
    );
};
