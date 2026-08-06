import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.scss';

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
        <div className={styles.loginContainer}>
            <h2 className={styles.title}>Вхід у систему</h2>
            <form onSubmit={handleLogin} className={styles.form}>
                <input
                    placeholder="Логін"
                    disabled={isLoading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.input}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitBtn}
                >
                    {isLoading ? 'Перевірка...' : 'Увійти'}
                </button>
            </form>

            <div className={styles.guestSection}>
                <button
                    onClick={handleGuestLogin}
                    className={styles.guestBtn}
                >
                    Увійти як Студент
                </button>
            </div>
        </div>
    );
};
