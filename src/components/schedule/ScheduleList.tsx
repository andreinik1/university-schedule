import { ScheduleCard } from './ScheduleCard';
import { BELLS1, BELLS2 } from '../../data/bells';
import { GROUPS_DATA } from '../../data/schedule';
import { useCurrentLesson } from '../../hooks/useCurrentLesson';
import styles from '../../assets/ScheduleList.module.scss';
import type { ILesson } from '../../types/schedule';

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
    groupName = "Менеджмент 1/1",
    day = "monday",
    weekType = "numerator"
}: { groupName?: string, day?: string, weekType?: "numerator" | "denominator" }) => {

    const groupSchedule = GROUPS_DATA[groupName];
    if (!groupSchedule) return <div>Групу не знайдено</div>;

    const daySchedule = groupSchedule[day.toLowerCase()];
    if (!daySchedule) return <div>На цей день розкладу немає</div>;

    // Знаходимо індекс останньої існуючої пари для конкретного типу тижня
    const lastLessonIndex = daySchedule.reduce((last, slot, index) => {
        const lesson = slot ? slot[weekType] : null;
        return lesson ? index : last;
    }, -1);

    return (
        <div className={styles.scheduleContainer}>
            {daySchedule.map((slot, index) => {
                // Якщо поточний індекс більший за індекс останньої пари — нічого не рендеримо
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
                        lesson={lesson}
                        index={index}
                        day={day}
                    />
                );
            })}
        </div>
    );
};