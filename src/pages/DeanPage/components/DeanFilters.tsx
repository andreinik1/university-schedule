import React from 'react';
import styles from '../DeanPage.module.scss';

interface DeanFiltersProps {
    startDate: string;
    setStartDate: (val: string) => void;
    endDate: string;
    setEndDate: (val: string) => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    showOnlyMissing: boolean;
    setShowOnlyMissing: (val: boolean) => void;
    selectedCourse: number | null;
    setSelectedCourse: (val: number | null) => void;
    fetchReports: () => void;
}

export const DeanFilters: React.FC<DeanFiltersProps> = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchTerm,
    setSearchTerm,
    showOnlyMissing,
    setShowOnlyMissing,
    selectedCourse,
    setSelectedCourse,
    fetchReports
}) => {
    return (
        <div className={`${styles.card} no-print`}>
            <div className={styles.filtersBox}>
                <div className={styles.dateRangeBox}>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={styles.inputDate}
                    />
                    <span style={{ color: '#64748b' }}>➔</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={styles.inputDate}
                    />
                </div>
                <input
                    type="text"
                    placeholder="🔍 Пошук..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.inputSearch}
                />

                <button
                    onClick={() => setShowOnlyMissing(!showOnlyMissing)}
                    className={`${styles.btnMissing} ${showOnlyMissing ? styles.active : ''}`}
                >
                    {showOnlyMissing ? '🔔 Показати всіх' : '❗ Тільки боржники'}
                </button>

                <button onClick={fetchReports} className={styles.btnBlue}>
                    Оновити ↻
                </button>
            </div>
            <div className={styles.coursesList}>
                {[1, 2, 3, 4].map(c => (
                    <button
                        key={c}
                        onClick={() => setSelectedCourse(selectedCourse === c ? null : c)}
                        className={`${styles.btnCourse} ${selectedCourse === c ? styles.active : ''}`}
                    >
                        {c} курс
                    </button>
                ))}
            </div>
        </div>
    );
};
