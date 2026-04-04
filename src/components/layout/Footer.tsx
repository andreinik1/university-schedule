
export const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '30px 20px 15px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            color: '#475569'
        }}>
            <div style={{
                maxWidth: '1100px',
                margin: '0 auto',
                display: 'flex',
                flexWrap: 'wrap', // Перенос блоків на мобільних
                justifyContent: 'space-between',
                gap: '30px'
            }}>
                {/* 1. Лого та адреса */}
                <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{
                            backgroundColor: '#16a34a',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'flex'
                        }}>
                            <img src="./logo.png" alt="MNAU" style={{ height: '30px', width: 'auto' }} />
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>МНАУ</span>
                    </div>
                    <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                        вулиця Георгія Гонгадзе, 9<br />
                        Миколаїв, Україна
                    </p>
                </div>

                {/* 2. Посилання */}
                <div style={{ flex: '1 1 150px' }}>
                    <h4 style={{ color: '#1e293b', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase' }}>Ресурси</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <a href="https://www.mnau.edu.ua/rozklad/" target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                                📅 Оригінальний розклад
                            </a>
                        </li>
                        <li>
                            <a href="https://www.mnau.edu.ua/faculty-men/" target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                                🏛️ Факультет Менеджменту
                            </a>
                        </li>
                    </ul>
                </div>

                {/* 3. Підтримка */}
                <div style={{ flex: '1 1 150px' }}>
                    <h4 style={{ color: '#1e293b', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase' }}>Підтримка</h4>
                    <p style={{ fontSize: '11px', marginBottom: '10px' }}>Знайшли баг?</p>
                    <a
                        href="https://mail.google.com/mail/?view=cm&to=sa.korolev.nik@gmail.com&subject=Attendance%20Bug%20Report"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            background: '#ef4444',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }}
                    >
                        Report a bug
                    </a>
                </div>
            </div>

            {/* Авторські права */}
            <div style={{
                maxWidth: '1100px',
                margin: '25px auto 0',
                paddingTop: '15px',
                borderTop: '1px solid #e2e8f0',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                    © {new Date().getFullYear()} <span style={{ fontWeight: '600' }}>Korolev Andrey KN 1/1</span>. All rights reserved.
                </p>
            </div>
        </footer>
    );
};