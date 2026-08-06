import React from 'react';
import styles from '../NewsPage.module.scss';

interface INews {
    id: string;
    title: string;
    content: string;
    author_role: string;
    created_at: string;
}

interface NewsCardProps {
    item: INews;
    canEdit: boolean | null;
    handleEdit: (item: INews) => void;
    handleDelete: (id: string) => void;
}

const getRoleName = (role: string) => {
    if (role === 'admin') return 'АДМІН';
    if (role === 'dean') return 'ДЕКАНАТ';
    if (role === 'scientific_dept') return 'НАУЧНИЙ ВІДДІЛ';
    return role.toUpperCase();
};

const getBadgeClass = (role: string) => {
    if (role === 'admin') return styles.badgeAdmin;
    if (role === 'dean') return styles.badgeDean;
    return styles.badgeScientific;
};

export const NewsCard: React.FC<NewsCardProps> = ({
    item,
    canEdit,
    handleEdit,
    handleDelete
}) => {
    return (
        <div className={styles.newsItem}>
            <div className={styles.itemHeader}>
                <div className={styles.headerLeft}>
                    <span className={getBadgeClass(item.author_role)}>
                        {getRoleName(item.author_role)}
                    </span>
                    <h2 className={styles.itemTitle}>{item.title}</h2>
                </div>

                {canEdit && (
                    <div className={styles.actions}>
                        <button
                            onClick={() => handleEdit(item)}
                            className={styles.btnEditLink}
                        >
                            📝 Редагувати
                        </button>
                        <button
                            onClick={() => handleDelete(item.id)}
                            className={styles.btnDeleteLink}
                        >
                            🗑️ Видалити
                        </button>
                    </div>
                )}
            </div>
            <p className={styles.itemContent}>{item.content}</p>
            <div className={styles.itemDate}>
                {new Date(item.created_at).toLocaleString('uk-UA')}
            </div>
        </div>
    );
};
