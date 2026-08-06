import React from 'react';
import type { ILesson } from '../../../types/schedule';
import styles from '../ScheduleEditorPage.module.scss';

const BUILDINGS = ['гк', 'кр', 'карп', 'м'];

interface LessonFormProps {
    title: string;
    lesson: ILesson | null;
    onChange: (l: ILesson) => void;
}

export const LessonForm: React.FC<LessonFormProps> = ({ title, lesson, onChange }) => {
    const data = lesson || { name: '', teacher: '', room: 'гк ' };
    const [building, roomNum] = (data.room || 'гк ').split(' ');
    const update = (field: keyof ILesson, value: string) => onChange({ ...data, [field]: value });

    return (
        <div className={styles.lessonForm}>
            <span className={styles.formTitle}>
                {title} {!lesson?.name && "(ВІКНО)"}
            </span>
            <input
                placeholder="Назва предмету"
                className={styles.input}
                value={data.name}
                onChange={e => update('name', e.target.value)}
            />
            <input
                placeholder="Викладач"
                className={styles.input}
                value={data.teacher}
                onChange={e => update('teacher', e.target.value)}
            />
            <div className={styles.roomRow}>
                <select
                    className={styles.roomSelect}
                    value={building}
                    onChange={e => update('room', `${e.target.value} ${roomNum || ''}`)}
                >
                    {BUILDINGS.map(b => (
                        <option key={b} value={b}>
                            {b}
                        </option>
                    ))}
                </select>
                <input
                    placeholder="Ауд."
                    className={styles.roomInput}
                    value={roomNum || ''}
                    onChange={e => update('room', `${building} ${e.target.value}`)}
                />
            </div>
        </div>
    );
};
