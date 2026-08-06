import { useState, useEffect } from 'react';
import { ScheduleList } from '../../components/schedule/ScheduleList/ScheduleList';
import { supabase } from '../../api/supabaseClient';
import { getLocalScheduleData } from '../../api/localSchedule';
import { ScheduleFilters } from './components/ScheduleFilters';
import type { IScheduleItem } from '../../types/schedule';
import styles from './SchedulePage.module.scss';

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
            if (!error && data && data.length > 0) {
                const uniqueGroups = Array.from(new Set(data.map(item => item.group_name))).sort();
                setAllGroups(uniqueGroups);
                if (!selectedGroup && uniqueGroups.length > 0) setSelectedGroup(uniqueGroups[0]);
                return;
            }

            const { groups } = getLocalScheduleData();
            setAllGroups(groups);
            if (!selectedGroup && groups.length > 0) setSelectedGroup(groups[0]);
        };
        fetchGroups();
    }, [selectedGroup]);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!selectedGroup) return;
            setLoading(true);
            localStorage.setItem('lastSelectedGroup', selectedGroup);

            const { data, error } = await supabase
                .from('schedule')
                .select('*')
                .eq('group_name', selectedGroup);

            if (!error && data) {
                setDbSchedule(data || []);
                setLoading(false);
                return;
            }

            const { schedule } = getLocalScheduleData();
            const fallbackSchedule = schedule.filter(item => item.group_name === selectedGroup);
            setDbSchedule(fallbackSchedule);
            setLoading(false);
        };
        fetchSchedule();
    }, [selectedGroup]);

    return (
        <div className={styles.schedulePage}>
            <ScheduleFilters
                days={DAYS}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                allGroups={allGroups}
                weekType={weekType}
                setWeekType={setWeekType}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                styles={styles}
            />

            {loading ? (
                <div className={styles.loadingText}>Отримуємо розклад...</div>
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
