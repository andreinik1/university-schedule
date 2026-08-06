import React from 'react';
import styles from '../NewsPage.module.scss';

interface NewsFormProps {
    editingId: string | null;
    title: string;
    setTitle: (val: string) => void;
    content: string;
    setContent: (val: string) => void;
    isPosting: boolean;
    handlePublish: () => void;
    setEditingId: (val: string | null) => void;
}

export const NewsForm: React.FC<NewsFormProps> = ({
    editingId,
    title,
    setTitle,
    content,
    setContent,
    isPosting,
    handlePublish,
    setEditingId
}) => {
    return (
        <div className={styles.postCard}>
            <h3>
                {editingId ? '📝 Редагувати новину' : 'Створити нове оголошення'}
            </h3>
            <input
                className={styles.input}
                placeholder="Заголовок новини..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                className={styles.textarea}
                placeholder="Текст повідомлення..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <div className={styles.btnContainer}>
                <button
                    onClick={handlePublish}
                    disabled={isPosting}
                    className={styles.btnPost}
                >
                    {isPosting ? 'Обробка...' : editingId ? 'Зберегти зміни' : 'Опублікувати для старост'}
                </button>
                {editingId && (
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setTitle('');
                            setContent('');
                        }}
                        className={styles.btnCancel}
                    >
                        Скасувати
                    </button>
                )}
            </div>
        </div>
    );
};
