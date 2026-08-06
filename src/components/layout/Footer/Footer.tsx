import styles from './Footer.module.scss';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.logoCol}>
                    <div className={styles.logoHeader}>
                        <div className={styles.logoContainer}>
                            <img src="./logo.png" alt="MNAU" className={styles.logoImg} />
                        </div>
                        <span className={styles.logoTitle}>МНАУ</span>
                    </div>
                    <p className={styles.addressText}>
                        вулиця Георгія Гонгадзе, 9<br />
                        Миколаїв, Україна
                    </p>
                </div>

                <div className={styles.linkCol}>
                    <h4 className={styles.colTitle}>Ресурси</h4>
                    <ul className={styles.linkList}>
                        <li>
                            <a href="https://www.mnau.edu.ua/rozklad/" target="_blank" rel="noreferrer" className={styles.link}>
                                📅 Оригінальний розклад
                            </a>
                        </li>
                        <li>
                            <a href="https://www.mnau.edu.ua/faculty-men/" target="_blank" rel="noreferrer" className={styles.link}>
                                🏛️ Факультет Менеджменту
                            </a>
                        </li>
                    </ul>
                </div>

                <div className={styles.supportCol}>
                    <h4 className={styles.colTitle}>Підтримка</h4>
                    <p className={styles.supportText}>Знайшли баг?</p>
                    <a
                        href="https://mail.google.com/mail/?view=cm&to=sa.korolev.nik@gmail.com&subject=Attendance%20Bug%20Report"
                        target="_blank"
                        rel="noreferrer"
                        className={styles.bugBtn}
                    >
                        Report a bug
                    </a>
                </div>
            </div>

            <div className={styles.copyright}>
                <p className={styles.copyrightText}>
                    © {new Date().getFullYear()} <span>Korolev Andrey KN 1/1</span>. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
