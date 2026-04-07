import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <nav style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', padding: '10px 15px', background: '#fff',
            borderBottom: '1px solid #e2e8f0', marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000, gap: '10px'
        }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <div style={{ backgroundColor: '#16a34a', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                        <img src="./logo.png" alt="MNAU" style={{ height: '30px', width: 'auto' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>MNAU</span>
                        <span style={{ fontWeight: '600', color: '#28a745', fontSize: '11px' }}>Attendance</span>
                    </div>
                </Link>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Link to="/" style={{ fontWeight: '600', textDecoration: 'none', color: '#475569', fontSize: '13px' }}>📅 Розклад</Link>

                    {(user.role === 'monitor' || user.role === 'dean' || user.role === 'admin' || user.role === 'scientific_dept') && (
                        <Link to="/news" style={{ fontWeight: '600', textDecoration: 'none', color: '#8b5cf6', fontSize: '13px' }}>📢 Новини</Link>
                    )}

                    {(user.role === 'monitor') && (
                        <Link to="/attendance" style={{ fontWeight: '600', textDecoration: 'none', color: '#007bff', fontSize: '13px' }}>📝 Звіт</Link>
                    )}

                    {(user.role === 'dean' || user.role === 'admin') && (
                        <Link to="/dean-reports" style={{ fontWeight: '600', textDecoration: 'none', color: '#28a745', fontSize: '13px' }}>📊 Звіти</Link>
                    )}

                    {(user.role === 'admin' || user.role === 'scientific_dept') && (
                        <Link to="/schedule-editor" style={{ fontWeight: '700', textDecoration: 'none', color: '#3b82f6', fontSize: '13px' }}>🛠 Редактор</Link>
                    )}

                    {user.role === 'admin' && (
                        <Link to="/admin" style={{ fontWeight: '700', textDecoration: 'none', color: '#ef4444', fontSize: '13px' }}>⚙️ Адмінка</Link>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>{user.username}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{user.group}</div>
                </div>
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    style={{
                        padding: '6px 12px', backgroundColor: '#fff', color: '#ef4444',
                        border: '1.5px solid #ef4444', borderRadius: '6px', fontSize: '12px',
                        fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                >
                    Вийти
                </button>
            </div>
        </nav>
    );
};