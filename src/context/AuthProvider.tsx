import React, { useState } from 'react';
import { AuthContext, type Role, type User } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (username: string, password: string): boolean => {
        // База даних користувачів
        const USERS_DB = [
            { user: 'dean_office', pass: 'dean321', role: 'dean' as Role, group: 'Деканат' },
            // 1 Курс
            { user: 'grs11', pass: 'pass123', role: 'monitor' as Role, group: 'ГРС 1/1' },
            { user: 'tur11', pass: 'pass123', role: 'monitor' as Role, group: 'ТУР 1/1' },
            { user: 'kn11', pass: 'pass123', role: 'monitor' as Role, group: 'КН 1/1' },
            { user: 'men11', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 1/1' },
            { user: 'men12', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 1/2' },
            { user: 'men13', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 1/3' },
            { user: 'pua11', pass: 'pass123', role: 'monitor' as Role, group: 'ПУА 1/1' },
            // 2 Курс
            { user: 'grs21', pass: 'pass123', role: 'monitor' as Role, group: 'ГРС 2/1' },
            { user: 'tur21', pass: 'pass123', role: 'monitor' as Role, group: 'ТУР 2/1' },
            { user: 'kn21', pass: 'pass123', role: 'monitor' as Role, group: 'КН 2/1' },
            { user: 'kn22', pass: 'pass123', role: 'monitor' as Role, group: 'КН 2/2' },
            { user: 'men21', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 2/1' },
            { user: 'men22', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 2/2' },
            { user: 'men23', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 2/3' },
            { user: 'pua21', pass: 'pass123', role: 'monitor' as Role, group: 'ПУА 2/1' },
            // 3 Курс
            { user: 'grs31', pass: 'pass123', role: 'monitor' as Role, group: 'ГРС 3/1' },
            { user: 'tur31', pass: 'pass123', role: 'monitor' as Role, group: 'ТУР 3/1' },
            { user: 'kn31', pass: 'pass123', role: 'monitor' as Role, group: 'КН 3/1' },
            { user: 'men31', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 3/1' },
            { user: 'men32', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 3/2' },
            { user: 'pua31', pass: 'pass123', role: 'monitor' as Role, group: 'ПУА 3/1' },
            // 4 Курс
            { user: 'grs41', pass: 'pass123', role: 'monitor' as Role, group: 'ГРС 4/1' },
            { user: 'tur41', pass: 'pass123', role: 'monitor' as Role, group: 'ТУР 4/1' },
            { user: 'kn41', pass: 'pass123', role: 'monitor' as Role, group: 'КН 4/1' },
            { user: 'men41', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 4/1' },
            { user: 'men42', pass: 'pass123', role: 'monitor' as Role, group: 'МЕН 4/2' },
            { user: 'pua41', pass: 'pass123', role: 'monitor' as Role, group: 'ПУА 4/1' },
        ];

        const found = USERS_DB.find(u => u.user === username && u.pass === password);

        if (found) {
            // Формуємо красиве ім'я: "КН 1/1 (староста)" або "Деканат"
            const displayName = found.role === 'dean'
                ? found.group
                : `${found.group} (староста)`;

            const newUser: User = {
                role: found.role,
                username: displayName,
                group: found.group
            };

            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            return true;
        }
        return false;
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
        <AuthContext.Provider value={{ user, login, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    );
};