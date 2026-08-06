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
      const now = new Date();

      const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = daysMap[now.getDay()];

      if (selectedDay.toLowerCase() !== todayName) {
        setIsActive(false);
        return;
      }

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

      setIsActive(currentMins >= start && currentMins <= end);
    };

    checkTime();
    const timer = setInterval(checkTime, 10000);
    return () => clearInterval(timer);
  }, [room, index, selectedDay]);

  return isActive;
};