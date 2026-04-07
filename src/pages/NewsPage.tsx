import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from '../hooks/useAuth';

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
                        setNews((prev) => [payload.new as INews, ...prev]);
                    } else if (payload.eventType === 'DELETE') {
                        setNews((prev) => prev.filter((item) => item.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        setNews((prev) => prev.map(item => item.id === payload.new.id ? (payload.new as INews) : item));
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [canRead]);

    const handlePublish = async () => {
        if (!title.trim() || !content.trim()) return alert("Заповніть всі поля!");
        setIsPosting(true);

        try {
            if (editingId) {
                // ЧІТКИЙ UPDATE
                const { error } = await supabase
                    .from('news_posts')
                    .update({
                        title: title.trim(),
                        content: content.trim()
                    })
                    .eq('id', editingId); // Обов'язково фільтруємо по ID

                if (error) throw error;
                alert("Зміни збережено!");
            } else {
                // ЧІТКИЙ INSERT
                const { error } = await supabase
                    .from('news_posts')
                    .insert([{
                        title: title.trim(),
                        content: content.trim(),
                        author_role: user?.role || 'unknown'
                    }]);

                if (error) throw error;
            }

            // Очищаємо все після успіху
            setTitle('');
            setContent('');
            setEditingId(null);
            fetchNews(); // Примусово оновлюємо список
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
    console.log("Намагаюсь видалити пост з ID:", id); // ПЕРЕВІР ЦЕ В КОНСОЛІ
    if (!window.confirm("Видалити цю новину?")) return;
    
    const { error } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', id);

    if (error) {
        alert("Помилка БД: " + error.message);
    } else {
        alert("Видалено успішно!");
    }
};

    const getRoleName = (role: string) => {
        if (role === 'admin') return 'АДМІН';
        if (role === 'dean') return 'ДЕКАНАТ';
        if (role === 'scientific_dept') return 'НАУЧНИЙ ВІДДІЛ';
        return role.toUpperCase();
    };

    if (!canRead) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#ef4444', fontWeight: 'bold' }}>
                🛑 У вас немає прав для перегляду цього розділу.
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ borderBottom: '2px solid #1e293b', paddingBottom: '10px', color: '#1e293b' }}>
                📢 Оголошення та Новини
            </h1>

            {canEdit && (
                <div style={postCardStyle}>
                    <h3 style={{ marginTop: 0, color: '#1e293b' }}>
                        {editingId ? '📝 Редагувати новину' : 'Створити нове оголошення'}
                    </h3>
                    <input
                        style={inputStyle}
                        placeholder="Заголовок новини..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                        placeholder="Текст повідомлення..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handlePublish}
                            disabled={isPosting}
                            style={isPosting ? btnDisabled : btnPost}
                        >
                            {isPosting ? 'Обробка...' : editingId ? 'Зберегти зміни' : 'Опублікувати для старост'}
                        </button>
                        {editingId && (
                            <button onClick={() => { setEditingId(null); setTitle(''); setContent(''); }} style={btnCancel}>
                                Скасувати
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '30px' }}>
                {news.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>Новин поки немає...</p>
                ) : (
                    news.map(item => (
                        <div key={item.id} style={newsItemStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div>
                                    <span style={badgeStyle(item.author_role)}>
                                        {getRoleName(item.author_role)}
                                    </span>
                                    <h2 style={{ margin: '8px 0 0 0', fontSize: '20px', color: '#1e293b' }}>{item.title}</h2>
                                </div>

                                {canEdit && (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => handleEdit(item)} style={btnEditLink}>
                                            📝 Редагувати
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} style={btnDeleteLink}>
                                            🗑️ Видалити
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p style={{ color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.content}</p>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '15px', textAlign: 'right' }}>
                                {new Date(item.created_at).toLocaleString('uk-UA')}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- СТИЛІ ---
const postCardStyle = {
    background: '#fff', padding: '20px', borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '30px'
};

const inputStyle = {
    width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px',
    border: '1px solid #cbd5e1', boxSizing: 'border-box' as const, fontSize: '15px', outline: 'none'
};

const btnPost = {
    background: '#8b5cf6', color: '#fff', border: 'none', padding: '12px 24px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' as const, flex: 1, fontSize: '15px'
};

const btnCancel = {
    background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 24px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '15px'
};

const btnDisabled = { ...btnPost, background: '#94a3b8', cursor: 'not-allowed' };

const newsItemStyle = {
    background: '#fff', padding: '20px', borderRadius: '12px',
    marginBottom: '20px', borderLeft: '6px solid #8b5cf6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderTop: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9'
};

const btnDeleteLink: React.CSSProperties = {
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
    fontWeight: '700', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px'
};

const btnEditLink: React.CSSProperties = {
    ...btnDeleteLink, color: '#3b82f6'
};

const badgeStyle = (role: string) => ({
    padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' as const,
    background: role === 'admin' ? '#ef4444' : role === 'dean' ? '#8b5cf6' : '#10b981',
    color: '#fff', textTransform: 'uppercase' as const
});