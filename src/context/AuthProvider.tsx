import React, { useState, useEffect } from 'react';
import { AuthContext, type Role, type User } from './AuthContext';
import { supabase } from '../api/supabaseClient';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    // 1. Оголошуємо стан завантаження
    const [loading, setLoading] = useState(true);

    // 2. Використовуємо useEffect для ініціалізації при першому запуску
    useEffect(() => {
        const initAuth = () => {
            const saved = localStorage.getItem('user');
            if (saved) {
                try {
                    setUser(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse user from localStorage", e);
                    localStorage.removeItem('user');
                }
            }
            // Кажемо системі, що ми завершили перевірку localStorage
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            // Шукаємо користувача в Supabase
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('login_name', username)
                .eq('password', password)
                .single();

            if (error || !data) {
                console.log("Login failed:", error?.message);
                return false;
            }

            // Формуємо об'єкт користувача
            const displayName = data.role === 'dean'
                ? data.group_name
                : `${data.group_name} (староста)`;

            const newUser: User = {
                role: data.role as Role,
                username: displayName,
                group: data.group_name
            };

            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            return true;
        } catch (err) {
            console.error("Auth error:", err);
            return false;
        }
    };

    const loginAsGuest = () => {
        const guestUser: User = { role: 'guest', username: 'Гість (студент)', group: 'Гість' };
        setUser(guestUser);
        localStorage.setItem('user', JSON.stringify(guestUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        // 3. Передаємо всі значення, включаючи loading
        <AuthContext.Provider value={{ user, loading, login, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    );
};