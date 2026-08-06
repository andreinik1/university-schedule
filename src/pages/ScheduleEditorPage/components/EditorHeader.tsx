import React from 'react';
import styles from '../ScheduleEditorPage.module.scss';

interface EditorHeaderProps {
    groups: string[];
    selectedGroup: string;
    setSelectedGroup: (val: string) => void;
    isSyncing: boolean;
    setIsSyncing: (val: boolean) => void;
    saving: boolean;
    saveAllChanges: () => void;
    createNewGroup: () => void;
    deleteCurrentGroup: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
    groups,
    selectedGroup,
    setSelectedGroup,
    isSyncing,
    setIsSyncing,
    saving,
    saveAllChanges,
    createNewGroup,
    deleteCurrentGroup
}) => {
    return (
        <div className={styles.header}>
            <div className={styles.titleArea}>
                <h2 style={{ margin: 0 }}>⚙️ Керування розкладом</h2>
                <div className={styles.btnGroup}>
                    <button onClick={createNewGroup} className={styles.actionBtn}>
                        ➕ Нова група
                    </button>
                    <button onClick={deleteCurrentGroup} className={styles.actionBtnDelete}>
                        🗑️ Видалити групу
                    </button>
                </div>
            </div>

            <div className={styles.controlsArea}>
                <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className={styles.select}
                >
                    {groups.map(g => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                    ))}
                </select>

                <label className={styles.syncLabel}>
                    <input
                        type="checkbox"
                        checked={isSyncing}
                        onChange={e => setIsSyncing(e.target.checked)}
                    />
                    <span>Синхронно (Ч/З)</span>
                </label>

                <button
                    onClick={saveAllChanges}
                    disabled={saving}
                    className={styles.saveAllBtn}
                    style={{ opacity: saving ? 0.7 : 1 }}
                >
                    {saving ? '...' : '💾 Зберегти все'}
                </button>
            </div>
        </div>
    );
};
