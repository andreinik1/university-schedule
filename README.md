# 🎓 Attendance System (Cloud DB)

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-fast-purple?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
![Status](https://img.shields.io/badge/status-active-success)

> Modern web application for automated student attendance tracking with real-time monitoring and role-based access.

---

## ✨ Overview

**Attendance System** — це full-stack веб-додаток для автоматизації обліку відвідуваності студентів у навчальних закладах. Система оптимізує процес збору даних, мінімізує ручну роботу та забезпечує швидкий доступ до аналітики у реальному часі.

Реалізовано дві ролі:
- 👨‍🎓 **Monitor (староста)** — швидке внесення даних  
- 🏛️ **Dean (деканат)** — контроль, аналітика та управління  

---

## 🚀 Key Features

- ⚡ Real-time data submission (до 10 секунд на звіт)  
- 🔁 Upsert логіка без дублювання записів  
- 🔍 Фільтрація та пошук (курси, групи, боржники)  
- 🛠 Повний CRUD функціонал  
- 📊 Експорт у Excel та PDF  
- 📱 Адаптивний Mobile-First UI  
- 🔒 Row Level Security (RLS)  

---

## 🧠 Tech Stack

- **Frontend:** React 18 + TypeScript  
- **Build Tool:** Vite  
- **Backend:** Supabase (PostgreSQL + Auth + RLS)  
- **Export:** xlsx, jspdf, jspdf-autotable  

---

## ⚙️ Getting Started

```bash
git clone https://github.com/your-username/attendance-app.git
cd attendance-app
npm install

VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

npm run dev

🗄 Database Setup
CREATE POLICY "Enable all actions for everyone"
ON attendance_reports
FOR ALL
USING (true);

ALTER TABLE attendance_reports
ADD CONSTRAINT unique_group_date
UNIQUE (group_name, date_only);

📊 Data Model

attendance_reports:

id - primary key
group_name - group name (КН-21)
online - online students
offline - offline students
total - sum
date_only - date
submitted_by - author