import { GROUPS_DATA } from '../data/schedule';
import type { IScheduleItem } from '../types/schedule';

const GROUP_NAME_ALIASES: Record<string, string> = {
  'Готельно-ресторанна справа': 'ГРС',
  'Туризм і рекреація': 'ТУР',
  "Комп'ютерні науки": 'КН',
  Менеджмент: 'МЕН',
  'Публічне управління та адміністрування': 'ПУА',
  Економіка: 'ЕК'
};

const buildLocalId = (value: string): number => {
  return Array.from(value).reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) >>> 0;
  }, 0);
};

export const normalizeGroupName = (groupName: string): string => {
  const trimmed = groupName.trim();
  const match = trimmed.match(/^(.*?)(\s+\d+\/\d+)?$/);
  const baseName = match?.[1]?.trim() || trimmed;
  const suffix = match?.[2] || '';
  const shortBase = GROUP_NAME_ALIASES[baseName] || baseName;
  return `${shortBase}${suffix}`;
};

export const getLocalScheduleData = () => {
  const groups = Object.keys(GROUPS_DATA)
    .map(normalizeGroupName)
    .filter((name, index, array) => array.indexOf(name) === index)
    .sort();

  const schedule: IScheduleItem[] = [];

  Object.entries(GROUPS_DATA).forEach(([groupName, days]) => {
    const normalizedGroupName = normalizeGroupName(groupName);

    Object.entries(days).forEach(([dayOfWeek, lessons]) => {
      lessons.forEach((slot, index) => {
        if (!slot || (!slot.numerator && !slot.denominator)) return;

        schedule.push({
          id: buildLocalId(`${normalizedGroupName}-${dayOfWeek}-${index + 1}`),
          group_name: normalizedGroupName,
          day_of_week: dayOfWeek,
          lesson_number: index + 1,
          numerator: slot.numerator,
          denominator: slot.denominator
        });
      });
    });
  });

  return { groups, schedule };
};
