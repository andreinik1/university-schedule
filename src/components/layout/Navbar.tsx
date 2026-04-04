import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // або '../context/AuthContext'

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 20px',
            background: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            marginBottom: '20px'
        }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>📅 Розклад</Link>

                {/* Кнопка тільки для Старости */}
                {user.role === 'monitor' && (
                    <Link to="/attendance" style={{ textDecoration: 'none', color: '#007bff' }}>📝 Відвідуваність</Link>
                )}

                {/* Кнопка тільки для Деканату */}
                {user.role === 'dean' && (
                    <Link to="/dean-reports" style={{ textDecoration: 'none', color: '#28a745' }}>📊 Звіти</Link>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>{user.username}</span>
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#fff',
                        color: '#ef4444',
                        border: '1.5px solid #ef4444',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = '#ef4444';
                    }}
                >
                    Вийти
                </button>
            </div>
        </nav>
    );
};