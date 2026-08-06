import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import type { IUser } from '../../types/user';
import styles from './AdminPage.module.scss';

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (id: number, field: keyof IUser, value: string) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
    };

    const saveChanges = async (user: IUser) => {
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
            .select();

        if (error) {
            alert(`Помилка: ${error.message}`);
        } else if (data && data.length > 0) {
            alert("Зміни збережено в БД!");
            fetchUsers();
        } else {
            alert("RLS заблокував запит. Виконайте SQL скрипт у консолі Supabase!");
        }
    };

    if (loading) return <div className={styles.adminPage} style={{ textAlign: 'center' }}>Завантаження списку...</div>;

    return (
        <div className={styles.adminPage}>
            <h2 className={styles.title}>
                Керування аккаунтами
            </h2>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Логін</th>
                            <th className={styles.th}>Пароль</th>
                            <th className={styles.th}>Група</th>
                            <th className={styles.th}>Роль</th>
                            <th className={styles.th}>Дія</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className={styles.tr}>
                                <td className={styles.td}>
                                    <input
                                        type="text"
                                        value={u.login_name}
                                        onChange={(e) => handleInputChange(u.id, 'login_name', e.target.value)}
                                        className={styles.input}
                                    />
                                </td>
                                <td className={styles.td}>
                                    <input
                                        type="text"
                                        value={u.password || ''}
                                        onChange={(e) => handleInputChange(u.id, 'password', e.target.value)}
                                        className={styles.input}
                                    />
                                </td>
                                <td className={styles.td}>{u.group_name}</td>
                                <td className={styles.td}>
                                    <select
                                        value={u.role || ''}
                                        onChange={(e) => handleInputChange(u.id, 'role', e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="guest">guest</option>
                                        <option value="monitor">monitor</option>
                                        <option value="dean">dean</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                                <td className={styles.td}>
                                    <button
                                        onClick={() => saveChanges(u)}
                                        className={styles.saveBtn}
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
