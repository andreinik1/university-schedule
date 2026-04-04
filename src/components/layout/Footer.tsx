export const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '40px 20px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            color: '#475569'
        }}>
            <div style={{
                maxWidth: '1100px',
                margin: '0 auto',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: '40px'
            }}>
                {/* 1. Лого та адреса */}
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <div style={{
                            backgroundColor: '#16a34a', // Зелений колір
                            padding: '5px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img src="./logo.png" alt="MNAU" style={{ height: '35px', filter: 'grayscale(100%)', opacity: 0.6 }} />
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>МНАУ</span>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                        вулиця Георгія Гонгадзе, 9<br />
                        Миколаїв, Миколаївська обл.<br />
                        Україна, 54000
                    </p>
                </div>

                {/* 2. Посилання */}
                <div style={{ flex: '1', minWidth: '180px' }}>
                    <h4 style={{ color: '#1e293b', fontSize: '14px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ресурси</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
                        <li style={{ marginBottom: '10px' }}>
                            <a href="https://www.mnau.edu.ua/rozklad/" target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                                📅 Оригінальний розклад
                            </a>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <a href="https://www.mnau.edu.ua/faculty-men/" target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                                🏛️ Факультет Менеджменту
                            </a>
                        </li>
                    </ul>
                </div>

                {/* 3. Підтримка */}
                <div style={{ flex: '1', minWidth: '180px' }}>
                    <h4 style={{ color: '#1e293b', fontSize: '14px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Підтримка</h4>
                    <p style={{ fontSize: '12px', marginBottom: '10px' }}>Знайшли баг або помилку в системі?</p>
                    <a
                        href="https://mail.google.com/mail/?view=cm&to=sa.korolev.nik@gmail.com&subject=Attendance%20Bug%20Report"
                        target="_blank"
                        style={{
                            display: 'inline-block',
                            padding: '10px 18px',
                            background: '#ef4444',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    >
                        Report a bug
                    </a>
                </div>
            </div>

            {/* 4. Авторські права та підпис */}
            <div style={{
                maxWidth: '1100px',
                margin: '40px auto 0',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                    © {new Date().getFullYear()} <span style={{ color: '#64748b', fontWeight: '600' }}>Korolev Andrey KN 1/1</span>. All rights reserved.
                </p>
            </div>
        </footer>
    );
};