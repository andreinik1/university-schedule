import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import styles from './Navbar.module.scss';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <nav className={styles.navbar}>
            <div className={styles.leftSection}>
                <Link to="/" className={styles.logoLink}>
                    <div className={styles.logoContainer}>
                        <img src="./logo.png" alt="MNAU" className={styles.logoImg} />
                    </div>
                    <div className={styles.logoTextContainer}>
                        <span className={styles.logoTitle}>MNAU</span>
                        <span className={styles.logoSubtitle}>Attendance</span>
                    </div>
                </Link>

                <div className={styles.navLinks}>
                    <Link to="/" className={styles.scheduleLink}>📅 Розклад</Link>

                    {(user.role === 'monitor' || user.role === 'dean' || user.role === 'admin' || user.role === 'scientific_dept') && (
                        <Link to="/news" className={styles.newsLink}>📢 Новини</Link>
                    )}

                    {user.role === 'monitor' && (
                        <Link to="/attendance" className={styles.attendanceLink}>📝 Звіт</Link>
                    )}

                    {(user.role === 'dean' || user.role === 'admin') && (
                        <Link to="/dean-reports" className={styles.reportsLink}>📊 Звіти</Link>
                    )}

                    {(user.role === 'admin' || user.role === 'scientific_dept') && (
                        <Link to="/schedule-editor" className={styles.editorLink}>🛠 Редактор</Link>
                    )}

                    {user.role === 'admin' && (
                        <Link to="/admin" className={styles.adminLink}>⚙️ Адмінка</Link>
                    )}
                </div>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.userInfo}>
                    <div className={styles.username}>{user.username}</div>
                    <div className={styles.userGroup}>{user.group}</div>
                </div>
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className={styles.logoutBtn}
                >
                    Вийти
                </button>
            </div>
        </nav>
    );
};
