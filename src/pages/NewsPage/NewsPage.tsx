import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { NewsForm } from './components/NewsForm';
import { NewsCard } from './components/NewsCard';
import styles from './NewsPage.module.scss';

interface INews {
    id: string;
    title: string;
    content: string;
    author_role: string;
    created_at: string;
}

export const NewsPage = () => {
    const { user } = useAuth();
    const [news, setNews] = useState<INews[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const canEdit = user && ['admin', 'dean', 'scientific_dept'].includes(user.role!);
    const canRead = user && ['admin', 'dean', 'scientific_dept', 'monitor'].includes(user.role!);

    const fetchNews = async () => {
        const { data } = await supabase
            .from('news_posts')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setNews(data);
    };

    useEffect(() => {
        if (!canRead) return;
        fetchNews();

        const channel = supabase
            .channel('news-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'news_posts' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setNews((prev) => {
                            if (prev.some((item) => item.id === payload.new.id)) {
                                return prev;
                            }
                            return [payload.new as INews, ...prev];
                        });
                    } else if (payload.eventType === 'DELETE') {
                        setNews((prev) => prev.filter((item) => item.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        setNews((prev) => prev.map(item => item.id === payload.new.id ? (payload.new as INews) : item));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [canRead]);

    const handlePublish = async () => {
        if (!title.trim() || !content.trim()) return alert("Заповніть всі поля!");
        setIsPosting(true);

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('news_posts')
                    .update({
                        title: title.trim(),
                        content: content.trim()
                    })
                    .eq('id', editingId);

                if (error) throw error;
                alert("Зміни збережено!");
            } else {
                const { error } = await supabase
                    .from('news_posts')
                    .insert([{
                        title: title.trim(),
                        content: content.trim(),
                        author_role: user?.role || 'unknown'
                    }]);

                if (error) throw error;
            }

            setTitle('');
            setContent('');
            setEditingId(null);
            fetchNews();
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : String(error);
            console.error("Помилка:", error);
            alert("Помилка бази даних: " + message);
        } finally {
            setIsPosting(false);
        }
    };

    const handleEdit = (item: INews) => {
        setEditingId(item.id);
        setTitle(item.title);
        setContent(item.content);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Видалити цю новину?")) return;

        const { error } = await supabase
            .from('news_posts')
            .delete()
            .eq('id', id);

        if (error) {
            alert("Помилка БД: " + error.message);
        } else {
            alert("Видалено успішно!");
            fetchNews();
        }
    };

    if (!canRead) {
        return (
            <div className={styles.unauthorized}>
                🛑 У вас немає прав для перегляду цього розділу.
            </div>
        );
    }

    return (
        <div className={styles.newsPage}>
            <h1 className={styles.title}>
                📢 Оголошення та Новини
            </h1>

            {canEdit && (
                <NewsForm
                    editingId={editingId}
                    title={title}
                    setTitle={setTitle}
                    content={content}
                    setContent={setContent}
                    isPosting={isPosting}
                    handlePublish={handlePublish}
                    setEditingId={setEditingId}
                />
            )}

            <div className={styles.newsList}>
                {news.length === 0 ? (
                    <p className={styles.noNews}>Новин поки немає...</p>
                ) : (
                    news.map(item => (
                        <NewsCard
                            key={item.id}
                            item={item}
                            canEdit={canEdit}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
