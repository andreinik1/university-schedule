import React from 'react';
import { ALL_GROUPS } from '../../../data/groups';
import styles from '../DeanPage.module.scss';

interface IReport {
    id: number;
    group_name: string;
    online: number;
    offline: number;
    total: number;
    date_only: string;
}

interface AttendanceTableProps {
    date: string;
    reports: IReport[];
    searchTerm: string;
    selectedCourse: number | null;
    showOnlyMissing: boolean;
    handleEdit: (report: IReport) => void;
    handleDelete: (id: number) => void;
    handleAddNew: (groupName: string, date: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
    date,
    reports,
    searchTerm,
    selectedCourse,
    showOnlyMissing,
    handleEdit,
    handleDelete,
    handleAddNew
}) => {
    return (
        <div className={styles.dateBlock}>
            <div className={styles.dateHeader}>📅 Звітність за {date}</div>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Група</th>
                            <th className={styles.th}>Онлайн</th>
                            <th className={styles.th}>Офлайн</th>
                            <th className={styles.th}>Всього</th>
                            <th className={`${styles.th} no-print`}>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ALL_GROUPS
                            .filter(g => g.toLowerCase().includes(searchTerm.toLowerCase()))
                            .filter(g => selectedCourse ? g.includes(` ${selectedCourse}/`) : true)
                            .map(group => {
                                const r = reports.find(rep => rep.group_name === group && rep.date_only === date);

                                if (showOnlyMissing && r) return null;

                                return (
                                    <tr key={group + date} className={styles.tr}>
                                        <td className={styles.tdGroup}>{group}</td>
                                        {r ? (
                                            <>
                                                <td className={styles.tdCenter}>{r.online}</td>
                                                <td className={styles.tdCenter}>{r.offline}</td>
                                                <td className={styles.tdTotal}>{r.total}</td>
                                                <td className={`${styles.tdCenter} no-print`}>
                                                    <div className={styles.actionsContainer}>
                                                        <button
                                                            onClick={() => handleEdit(r)}
                                                            className={styles.btnEdit}
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(r.id)}
                                                            className={styles.btnDelete}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td colSpan={3} className={styles.missingText}>
                                                    Не здано
                                                </td>
                                                <td className={`${styles.tdCenter} no-print`}>
                                                    <button
                                                        onClick={() => handleAddNew(group, date)}
                                                        className={styles.btnAdd}
                                                    >
                                                        +
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
