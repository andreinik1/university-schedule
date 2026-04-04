import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Перевіряємо логін
        const isSuccess = login(username, password);

        if (isSuccess) {
            // Якщо це декан — шлемо на звіти, якщо ні — на головну
            // Використовуємо replace: true, щоб "затерти" сторінку логіну в історії
            if (username === 'dean') {
                navigate('/dean-reports', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } else {
            alert('Невірний логін або пароль');
        }
    };

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate('/', { replace: true });
    };

    return (
        <div style={{ padding: '40px', maxWidth: '400px', margin: '100px auto', border: '1px solid #ddd', borderRadius: '15px', textAlign: 'center', background: '#fff' }}>
            <h2 style={{ marginBottom: '20px' }}>Вхід у систему</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    placeholder="Логін"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <button type="submit" style={{ padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Увійти
                </button>
            </form>

            <div style={{ margin: '20px 0', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button
                    onClick={handleGuestLogin}
                    style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}
                >
                    Увійти як Студент
                </button>
            </div>
        </div>
    );
};