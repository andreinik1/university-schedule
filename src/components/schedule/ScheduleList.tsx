import { ScheduleCard } from './ScheduleCard';
import { BELLS1, BELLS2 } from '../../data/bells';
import { useCurrentLesson } from '../../hooks/useCurrentLesson';
import styles from '../../assets/ScheduleList.module.scss';
import type { ILesson, LessonSlot, IScheduleItem } from '../../types/schedule';

const LessonItem = ({ lesson, index, day }: { lesson: ILesson, index: number, day: string }) => {
    const isKR = lesson.room?.toLowerCase().includes('кр');
    const bells = isKR ? BELLS2 : BELLS1;
    const timePeriod = bells[index] || { start: "??:??", end: "??:??" };
    const timeString = `${timePeriod.start} - ${timePeriod.end}`;
    const isActive = useCurrentLesson(lesson.room, index, day);

    return (
        <ScheduleCard
            name={lesson.name}
            teacher={lesson.teacher}
            room={lesson.room}
            time={timeString}
            isActive={isActive}
        />
    );
};

export const ScheduleList = ({
    data = [],
    day = "monday",
    weekType = "numerator"
}: { data: IScheduleItem[], day: string, weekType: "numerator" | "denominator" }) => {

    // Створюємо порожню сітку на 5 пар для обраного дня
    const daySchedule: LessonSlot[] = Array(5).fill(null);

    // Заповнюємо сітку даними з БД
    data.filter(item => item.day_of_week === day).forEach(item => {
        const index = item.lesson_number - 1; // 1 пара -> 0 індекс
        if (index >= 0 && index < 5) {
            daySchedule[index] = {
                numerator: item.numerator,
                denominator: item.denominator
            };
        }
    });

    // Знаходимо індекс останньої пари
    const lastLessonIndex = daySchedule.reduce((last, slot, index) => {
        const lesson = slot ? slot[weekType] : null;
        return lesson ? index : last;
    }, -1);

    if (lastLessonIndex === -1) return <div style={{ textAlign: 'center', padding: '20px' }}>На цей день розкладу немає</div>;

    return (
        <div className={styles.scheduleContainer}>
            {daySchedule.map((slot, index) => {
                if (index > lastLessonIndex) return null;
                const lesson = slot ? slot[weekType] : null;

                if (!lesson) {
                    return (
                        <div key={index} className={styles.windowWrapper}>
                            <div className={styles.windowBadge}>Вікно</div>
                        </div>
                    );
                }

                return (
                    <LessonItem
                        key={index}
                        lesson={lesson as ILesson}
                        index={index}
                        day={day}
                    />
                );
            })}
        </div>
    );
};