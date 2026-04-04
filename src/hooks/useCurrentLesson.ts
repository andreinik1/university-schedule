import { useState, useEffect } from 'react';
import { BELLS1, BELLS2 } from '../data/bells';

const timeToMins = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const useCurrentLesson = (room: string | undefined, index: number, selectedDay: string) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      // --- ТЕСТОВИЙ БЛОК (НЕ ВИДАЛЯТИ) ---
      // 2026-04-06 — це ПОНЕДІЛОК (monday)
      //const now = new Date("2026-04-08T09:15:00"); 
       const now = new Date();
      // ----------------------------------

      // Визначаємо назву поточного (тестового) дня
      const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = daysMap[now.getDay()]; // поверне 'monday' для нашої дати

      // 1. Перевірка: чи збігається вибраний у вкладках день із "сьогоднішнім"
      if (selectedDay.toLowerCase() !== todayName) {
        setIsActive(false);
        return;
      }

      // 2. Логіка розрахунку часу
      const currentMins = now.getHours() * 60 + now.getMinutes();
      
      const isKR = room?.toLowerCase().includes('кр');
      const bells = isKR ? BELLS2 : BELLS1;
      const period = bells[index];

      if (!period) {
        setIsActive(false);
        return;
      }

      const start = timeToMins(period.start);
      const end = timeToMins(period.end);

      // 3. Перевірка: чи поточний час в межах цієї пари
      setIsActive(currentMins >= start && currentMins <= end);
    };

    checkTime();
    // Оновлюємо частіше для точності тесту
    const timer = setInterval(checkTime, 10000); 
    return () => clearInterval(timer);
  }, [room, index, selectedDay]);

  return isActive;
};