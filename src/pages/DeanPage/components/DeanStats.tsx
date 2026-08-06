import React from 'react';
import styles from '../DeanPage.module.scss';

interface DeanStatsProps {
    stats: {
        attendanceRate: number;
        avgDaily: number;
        diff: number;
        diffPercent: number;
    };
}

export const DeanStats: React.FC<DeanStatsProps> = ({ stats }) => {
    return (
        <div className={styles.statsGrid}>
            <div className={styles.statCard} style={{ borderLeft: '6px solid #3b82f6' }}>
                <span className={styles.statLabel}>Загальна відвідуваність</span>
                <div className={styles.statValue}>{stats.attendanceRate}%</div>
                <span className={styles.statSub}>Звітів здано вчасно</span>
            </div>
            <div className={styles.statCard} style={{ borderLeft: '6px solid #10b981' }}>
                <span className={styles.statLabel}>Середньо за день</span>
                <div className={styles.statValue}>{stats.avgDaily}</div>
                <span className={styles.statSub}>Студентів на парах</span>
            </div>
            <div className={styles.statCard} style={{ borderLeft: `6px solid ${stats.diff >= 0 ? '#8b5cf6' : '#ef4444'}` }}>
                <span className={styles.statLabel}>Динаміка (сьогодні)</span>
                <div className={styles.statValue}>{stats.diff > 0 ? `+${stats.diff}` : stats.diff}</div>
                <span className={styles.statSub}>
                    {stats.diffPercent >= 0 ? '📈 Краще' : '📉 Гірше'} на {Math.abs(stats.diffPercent)}%, ніж вчора
                </span>
            </div>
        </div>
    );
};
