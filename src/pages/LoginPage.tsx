import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const isSuccess = await login(username, password);

            if (isSuccess) {
                // В HashRouter ми просто вказуємо шлях від кореня
                if (username === 'dean_office') {
                    navigate('/dean-reports', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } else {
                alert('Невірний логін або пароль');
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Сталася помилка при вході");
        } finally {
            setIsLoading(false);
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
                    disabled={isLoading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: '12px',
                        background: isLoading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {isLoading ? 'Перевірка...' : 'Увійти'}
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