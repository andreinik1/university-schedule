import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion'; 
import type { IScheduleItem, ILesson } from '../types/schedule';

const BUILDINGS = ['гк', 'кр', 'карп', 'м'];
const DAYS_ENG = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export const ScheduleEditorPage = () => {
    const [schedule, setSchedule] = useState<IScheduleItem[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchGroups = useCallback(async (selectLast = false) => {
        const { data } = await supabase.from('schedule').select('group_name');
        if (data) {
            const uniqueGroups = Array.from(new Set(data.map(item => item.group_name)));
            setGroups(uniqueGroups);
            if (uniqueGroups.length > 0) {
                if (selectLast) setSelectedGroup(uniqueGroups[uniqueGroups.length - 1]);
                else if (!selectedGroup) setSelectedGroup(uniqueGroups[0]);
            }
        }
    }, [selectedGroup]);

    const fetchSchedule = useCallback(async () => {
        if (!selectedGroup) return;
        setLoading(true);
        const { data } = await supabase
            .from('schedule')
            .select('*')
            .eq('group_name', selectedGroup)
            .order('day_of_week')
            .order('lesson_number');

        if (data) {
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
        }
        setLoading(false);
    }, [selectedGroup]);

    useEffect(() => { fetchGroups(); }, []);
    useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

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

    // --- НОВІ ФУНКЦІЇ ДЛЯ ГРУП ---

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
            await fetchGroups(true); // Перемикаємося на нову групу
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

    // ----------------------------

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
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <h2 style={{ margin: 0 }}>⚙️ Керування розкладом</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={createNewGroup} style={actionBtnStyle}>➕ Нова група</button>
                        <button onClick={deleteCurrentGroup} style={{...actionBtnStyle, background: '#ef4444'}}>🗑️ Видалити групу</button>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} style={selectStyle}>
                        {groups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    
                    <label style={syncLabelStyle}>
                        <input type="checkbox" checked={isSyncing} onChange={e => setIsSyncing(e.target.checked)} />
                        <span>Синхронно (Ч/З)</span>
                    </label>

                    <button onClick={saveAllChanges} disabled={saving} style={{...saveAllBtnStyle, opacity: saving ? 0.7 : 1}}>
                        {saving ? '...' : '💾 Зберегти все'}
                    </button>
                </div>
            </div>

            {loading ? <p>Завантаження...</p> : (
                DAYS_ENG.map(day => {
                    const dayLessons = schedule.filter(s => s.day_of_week === day).sort((a, b) => a.lesson_number - b.lesson_number);
                    return (
                        <div key={day} style={{ marginBottom: '40px' }}>
                            <div style={dayHeaderStyle}><h3 style={{ textTransform: 'uppercase', margin: 0 }}>{day}</h3></div>
                            <AnimatePresence mode="popLayout">
                                {dayLessons.map((item, index) => (
                                    <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={lessonRowStyle}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                                            <button onClick={() => moveLesson(index, 'up', day)} style={arrowStyle}>▲</button>
                                            <div style={badgeStyle}>№{item.lesson_number}</div>
                                            <button onClick={() => moveLesson(index, 'down', day)} style={arrowStyle}>▼</button>
                                        </div>
                                        <LessonForm title="Чисельник" lesson={item.numerator} onChange={(val) => setSchedule(prev => prev.map(s => s.id === item.id ? { ...s, numerator: val } : s))} />
                                        {!isSyncing && <LessonForm title="Знаменник" lesson={item.denominator} onChange={(val) => setSchedule(prev => prev.map(s => s.id === item.id ? { ...s, denominator: val } : s))} />}
                                        <button onClick={() => { if(window.confirm("Очистити пару?")) setSchedule(prev => prev.map(s => s.id === item.id ? {...s, numerator: null, denominator: null} : s)) }} style={delBtnStyle}>🗑️</button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    );
                })
            )}
        </div>
    );
};

const LessonForm = ({ title, lesson, onChange }: { title: string, lesson: ILesson | null, onChange: (l: ILesson) => void }) => {
    const data = lesson || { name: '', teacher: '', room: 'гк ' };
    const [building, roomNum] = (data.room || 'гк ').split(' ');
    const update = (field: keyof ILesson, value: string) => onChange({ ...data, [field]: value });
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>{title} {!lesson?.name && "(ВІКНО)"}</span>
            <input placeholder="Назва предмету" style={inputStyle} value={data.name} onChange={e => update('name', e.target.value)} />
            <input placeholder="Викладач" style={inputStyle} value={data.teacher} onChange={e => update('teacher', e.target.value)} />
            <div style={{ display: 'flex', gap: '5px' }}>
                <select style={{...inputStyle, width: '80px'}} value={building} onChange={e => update('room', `${e.target.value} ${roomNum || ''}`)}>
                    {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <input placeholder="Ауд." style={inputStyle} value={roomNum || ''} onChange={e => update('room', `${building} ${e.target.value}`)} />
            </div>
        </div>
    );
};

// --- Стилі ---
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #334155', paddingBottom: '15px' };
const selectStyle: React.CSSProperties = { padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' };
const syncLabelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' };
const saveAllBtnStyle: React.CSSProperties = { background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', minWidth: '130px' };
const actionBtnStyle: React.CSSProperties = { background: '#22c55e', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const dayHeaderStyle: React.CSSProperties = { background: '#334155', color: '#fff', padding: '10px 15px', borderRadius: '8px 8px 0 0' };
const lessonRowStyle: React.CSSProperties = { display: 'flex', gap: '15px', alignItems: 'center', padding: '15px', border: '1px solid #e2e8f0', background: '#fff', borderTop: 'none' };
const badgeStyle: React.CSSProperties = { background: '#ef4444', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' };
const inputStyle: React.CSSProperties = { padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px' };
const arrowStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' };
const delBtnStyle: React.CSSProperties = { background: '#94a3b8', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' };