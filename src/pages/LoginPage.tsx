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
    if (login(username, password)) {
      navigate('/');
    } else {
      alert('Невірний логін або пароль');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '100px auto', border: '1px solid #ddd', borderRadius: '15px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '20px' }}>Вхід у систему</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          placeholder="Логін" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Увійти
        </button>
      </form>
      <div style={{ margin: '20px 0', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <button onClick={() => { loginAsGuest(); navigate('/'); }} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}>
          Увійти як Студент
        </button>
      </div>
    </div>
  );
};