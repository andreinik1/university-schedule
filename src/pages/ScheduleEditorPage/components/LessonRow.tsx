import React from 'react';
import { motion } from 'framer-motion';
import { LessonForm } from './LessonForm';
import type { IScheduleItem, ILesson } from '../../../types/schedule';
import styles from '../ScheduleEditorPage.module.scss';

interface LessonRowProps {
    item: IScheduleItem;
    isSyncing: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onNumeratorChange: (val: ILesson) => void;
    onDenominatorChange: (val: ILesson) => void;
    onClear: () => void;
}

export const LessonRow: React.FC<LessonRowProps> = ({
    item,
    isSyncing,
    onMoveUp,
    onMoveDown,
    onNumeratorChange,
    onDenominatorChange,
    onClear
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={styles.lessonRow}
        >
            <div className={styles.rowControls}>
                <button onClick={onMoveUp} className={styles.arrowBtn}>▲</button>
                <div className={styles.lessonBadge}>№{item.lesson_number}</div>
                <button onClick={onMoveDown} className={styles.arrowBtn}>▼</button>
            </div>

            <LessonForm
                title="Чисельник"
                lesson={item.numerator}
                onChange={onNumeratorChange}
            />

            {!isSyncing && (
                <LessonForm
                    title="Знаменник"
                    lesson={item.denominator}
                    onChange={onDenominatorChange}
                />
            )}

            <button onClick={onClear} className={styles.delBtn}>
                🗑️
            </button>
        </motion.div>
    );
};
