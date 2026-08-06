import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../api/supabaseClient';
import { getLocalScheduleData } from '../../api/localSchedule';
import { AnimatePresence } from 'framer-motion';
import { EditorHeader } from './components/EditorHeader';
import { LessonRow } from './components/LessonRow';
import type { IScheduleItem } from '../../types/schedule';
import styles from './ScheduleEditorPage.module.scss';

const DAYS_ENG = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export const ScheduleEditorPage = () => {
    const [schedule, setSchedule] = useState<IScheduleItem[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchGroups = useCallback(async (selectLast = false) => {
        const { data, error } = await supabase.from('schedule').select('group_name');
        if (!error && data && data.length > 0) {
            const uniqueGroups = Array.from(new Set(data.map(item => item.group_name)));
            setGroups(uniqueGroups);
            if (uniqueGroups.length > 0) {
                if (selectLast) setSelectedGroup(uniqueGroups[uniqueGroups.length - 1]);
                else if (!selectedGroup) setSelectedGroup(uniqueGroups[0]);
            }
            return;
        }

        const { groups } = getLocalScheduleData();
        setGroups(groups);
        if (groups.length > 0) {
            if (selectLast) setSelectedGroup(groups[groups.length - 1]);
            else if (!selectedGroup) setSelectedGroup(groups[0]);
        }
    }, [selectedGroup]);

    const fetchSchedule = useCallback(async () => {
        if (!selectedGroup) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('schedule')
            .select('*')
            .eq('group_name', selectedGroup)
            .order('day_of_week')
            .order('lesson_number');

        if (!error && data) {
            const fullData = data as IScheduleItem[];
            const templateSchedule: IScheduleItem[] = [];

            DAYS_ENG.forEach(day => {
                for (let i = 1; i <= 5; i++) {
                    const existing = fullData.find(s => s.day_of_week === day && s.lesson_number === i);
                    templateSchedule.push(existing || {
                        id: Math.random(),
                        group_name: selectedGroup,
                        day_of_week: day,
                        lesson_number: i,
                        numerator: null,
                        denominator: null
                    } as IScheduleItem);
                }
            });
            setSchedule(templateSchedule);
            setLoading(false);
            return;
        }

        const { schedule } = getLocalScheduleData();
        const fullData = schedule.filter(item => item.group_name === selectedGroup);
        const templateSchedule: IScheduleItem[] = [];

        DAYS_ENG.forEach(day => {
            for (let i = 1; i <= 5; i++) {
                const existing = fullData.find(s => s.day_of_week === day && s.lesson_number === i);
                templateSchedule.push(existing || {
                    id: Math.random(),
                    group_name: selectedGroup,
                    day_of_week: day,
                    lesson_number: i,
                    numerator: null,
                    denominator: null
                } as IScheduleItem);
            }
        });

        setSchedule(templateSchedule);
        setLoading(false);
    }, [selectedGroup]);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const saveAllChanges = async () => {
        setSaving(true);
        const payloads = schedule.map(item => ({
            group_name: selectedGroup,
            day_of_week: item.day_of_week,
            lesson_number: item.lesson_number,
            numerator: item.numerator?.name?.trim() ? item.numerator : null,
            denominator: isSyncing
                ? (item.numerator?.name?.trim() ? item.numerator : null)
                : (item.denominator?.name?.trim() ? item.denominator : null)
        }));

        const { error } = await supabase
            .from('schedule')
            .upsert(payloads, { onConflict: 'group_name,day_of_week,lesson_number' });

        setSaving(false);
        if (error) alert("Помилка при збереженні: " + error.message);
        else alert("Розклад збережено! ✅");
    };

    const createNewGroup = async () => {
        const newName = prompt("Введіть назву нової групи (напр. ТУР-21):");
        if (!newName || groups.includes(newName)) return alert("Назва некоректна або група вже існує");

        setSaving(true);
        const newRows = [];
        for (const day of DAYS_ENG) {
            for (let i = 1; i <= 5; i++) {
                newRows.push({
                    group_name: newName,
                    day_of_week: day,
                    lesson_number: i,
                    numerator: null,
                    denominator: null
                });
            }
        }

        const { error } = await supabase.from('schedule').insert(newRows);
        if (error) alert("Помилка створення: " + error.message);
        else {
            await fetchGroups(true);
            alert(`Групу ${newName} створено з порожнім шаблоном!`);
        }
        setSaving(false);
    };

    const deleteCurrentGroup = async () => {
        if (!selectedGroup) return;
        if (!window.confirm(`ВИДАЛИТИ ПОВНІСТЮ групу ${selectedGroup} та весь її розклад?`)) return;

        setSaving(true);
        const { error } = await supabase.from('schedule').delete().eq('group_name', selectedGroup);

        if (error) alert("Помилка видалення: " + error.message);
        else {
            const remainingGroups = groups.filter(g => g !== selectedGroup);
            setGroups(remainingGroups);
            setSelectedGroup(remainingGroups[0] || '');
            alert("Групу видалено");
        }
        setSaving(false);
    };

    const moveLesson = (currentIndex: number, direction: 'up' | 'down', day: string) => {
        const dayLessons = [...schedule.filter(s => s.day_of_week === day)].sort((a, b) => a.lesson_number - b.lesson_number);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= dayLessons.length) return;

        const newDayLessons = [...dayLessons];
        const current = { ...newDayLessons[currentIndex] };
        const target = { ...newDayLessons[targetIndex] };

        const tempNum = current.lesson_number;
        current.lesson_number = target.lesson_number;
        target.lesson_number = tempNum;

        newDayLessons[currentIndex] = target;
        newDayLessons[targetIndex] = current;

        setSchedule(prev => prev.map(s => {
            const updated = newDayLessons.find(nd => nd.id === s.id);
            return updated ? updated : s;
        }));
    };

    return (
        <div className={styles.editorPage}>
            <EditorHeader
                groups={groups}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                isSyncing={isSyncing}
                setIsSyncing={setIsSyncing}
                saving={saving}
                saveAllChanges={saveAllChanges}
                createNewGroup={createNewGroup}
                deleteCurrentGroup={deleteCurrentGroup}
            />

            {loading ? (
                <p>Завантаження...</p>
            ) : (
                DAYS_ENG.map(day => {
                    const dayLessons = schedule
                        .filter(s => s.day_of_week === day)
                        .sort((a, b) => a.lesson_number - b.lesson_number);
                    return (
                        <div key={day} className={styles.dayContainer}>
                            <div className={styles.dayHeader}>
                                <h3>{day}</h3>
                            </div>
                            <AnimatePresence mode="popLayout">
                                {dayLessons.map((item, index) => (
                                    <LessonRow
                                        key={item.id}
                                        item={item}
                                        isSyncing={isSyncing}
                                        onMoveUp={() => moveLesson(index, 'up', day)}
                                        onMoveDown={() => moveLesson(index, 'down', day)}
                                        onNumeratorChange={(val) =>
                                            setSchedule(prev =>
                                                prev.map(s => (s.id === item.id ? { ...s, numerator: val } : s))
                                            )
                                        }
                                        onDenominatorChange={(val) =>
                                            setSchedule(prev =>
                                                prev.map(s => (s.id === item.id ? { ...s, denominator: val } : s))
                                            )
                                        }
                                        onClear={() => {
                                            if (window.confirm("Очистити пару?")) {
                                                setSchedule(prev =>
                                                    prev.map(s =>
                                                        s.id === item.id
                                                            ? { ...s, numerator: null, denominator: null }
                                                            : s
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    );
                })
            )}
        </div>
    );
};
