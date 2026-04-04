import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// Імпортуємо лого, щоб Vite його бачив

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            {/* Ліва частина: Логотип + Навігація */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    {/* Контейнер для логотипу з фоном */}
                    <div style={{
                        backgroundColor: '#16a34a', // Зелений колір
                        padding: '5px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src="./logo.png"
                            alt="MNAU Logo"
                            style={{ height: '32px', width: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '16px' }}>MNAU</span>
                        <span style={{ fontWeight: '600', color: '#28a745', fontSize: '12px' }}>Attendance</span>
                    </div>
                </Link>

                <div style={{ display: 'flex', gap: '15px', marginLeft: '10px' }}>
                    <Link to="/" style={{ fontWeight: '600', textDecoration: 'none', color: '#475569', fontSize: '14px' }}>📅 Розклад</Link>

                    {user.role === 'monitor' && (
                        <Link to="/attendance" style={{ fontWeight: '600', textDecoration: 'none', color: '#007bff', fontSize: '14px' }}>📝 Відвідуваність</Link>
                    )}

                    {user.role === 'dean' && (
                        <Link to="/dean-reports" style={{ fontWeight: '600', textDecoration: 'none', color: '#28a745', fontSize: '14px' }}>📊 Звіти</Link>
                    )}
                </div>
            </div>

            {/* Права частина: Інфо про юзера + Вихід */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>{user.username}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{user.group}</div>
                </div>

                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    style={{
                        padding: '8px 14px',
                        backgroundColor: '#fff',
                        color: '#ef4444',
                        border: '1.5px solid #ef4444',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
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