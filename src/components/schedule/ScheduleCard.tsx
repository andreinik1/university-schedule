import React from 'react';
import styles from '../../assets/ScheduleCard.module.scss';

export const ScheduleCard: React.FC<{ name: string; teacher: string; room?: string; time: string; isActive?: boolean }> = ({
    name,
    teacher,
    room,
    time,
    isActive
}) => {
    return (
        <div className={`${styles.scheduleCard} ${isActive ? styles.activeCard : ''}`}>
            <div className={`${styles.statusBar} ${isActive ? styles.activeStatus : ''}`}></div>
            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <h3>{name}</h3>
                    <p className={styles.timeTag}>{time}</p>
                </div>
                <div className={styles.cardDetails}>
                    <p><span>👤</span> {teacher || "Викладач не вказаний"}</p>
                    <p><span>🚪</span> {room || "Не вказано"}</p>
                </div>
            </div>
        </div>
    );
};