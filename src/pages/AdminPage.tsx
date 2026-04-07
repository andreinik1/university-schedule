import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import type { IUser } from '../types/user';

export const AdminPage = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error("Error fetching users:", error.message);
        } else if (data) {
            setUsers(data as IUser[]);
        }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchUsers(); }, []);

    // Універсальна функція оновлення будь-якого поля
    const handleInputChange = (id: number, field: keyof IUser, value: string) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
    };

    // Збереження змін у базу
    const saveChanges = async (user: IUser) => {
        // 1. Отримуємо дані поточного адміна з localStorage (або контексту)
        const adminData = JSON.parse(localStorage.getItem('user') || '{}');

        if (adminData.role !== 'admin') {
            alert("У вас немає прав для цієї дії!");
            return;
        }

        const { data, error } = await supabase
            .from('users')
            .update({
                login_name: user.login_name,
                password: user.password,
                role: user.role
            })
            .eq('id', user.id)
            .select(); // ОБОВ'ЯЗКОВО для перевірки RLS

        if (error) {
            alert(`Помилка: ${error.message}`);
        } else if (data && data.length > 0) {
            alert("Зміни збережено в БД!");
            fetchUsers();
        } else {
            alert("RLS заблокував запит. Виконайте SQL скрипт у консолі Supabase!");
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Завантаження списку...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2 style={{ borderBottom: '2px solid #ef4444', paddingBottom: '10px', color: '#1e293b' }}>
                Керування аккаунтами
            </h2>
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                            <th style={thStyle}>Логін</th>
                            <th style={thStyle}>Пароль</th>
                            <th style={thStyle}>Група</th>
                            <th style={thStyle}>Роль</th>
                            <th style={thStyle}>Дія</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={tdStyle}>
                                    <input
                                        type="text"
                                        value={u.login_name}
                                        onChange={(e) => handleInputChange(u.id, 'login_name', e.target.value)}
                                        style={inputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>
                                    <input
                                        type="text"
                                        value={u.password || ''}
                                        onChange={(e) => handleInputChange(u.id, 'password', e.target.value)}
                                        style={inputStyle}
                                    />
                                </td>
                                <td style={tdStyle}>{u.group_name}</td>
                                <td style={tdStyle}>
                                    <select
                                        value={u.role || ''}
                                        onChange={(e) => handleInputChange(u.id, 'role', e.target.value)}
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                    >
                                        <option value="guest">guest</option>
                                        <option value="monitor">monitor</option>
                                        <option value="dean">dean</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => saveChanges(u)}
                                        style={saveBtnStyle}
                                    >
                                        Зберегти
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Міні-стилі для чистоти коду
const thStyle: React.CSSProperties = { padding: '12px', border: '1px solid #ddd', fontSize: '14px' };
const tdStyle: React.CSSProperties = { padding: '8px', border: '1px solid #ddd' };
const inputStyle: React.CSSProperties = {
    width: '90%',
    padding: '6px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px'
};
const saveBtnStyle: React.CSSProperties = {
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px'
};