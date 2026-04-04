export const ALL_GROUPS = [
  "ГРС 1/1", "ТУР 1/1", "КН 1/1", "МЕН 1/1", "МЕН 1/2", "МЕН 1/3", "ПУА 1/1",
  "ГРС 2/1", "ТУР 2/1", "КН 2/1", "КН 2/2", "МЕН 2/1", "МЕН 2/2", "МЕН 2/3", "ПУА 2/1", "ЕК 2/1",
  "ГРС 3/1", "ТУР 3/1", "КН 3/1", "МЕН 3/1", "МЕН 3/2", "ЕК 3/1",
  "ГРС 4/1", "ТУР 4/1", "КН 4/1", "МЕН 4/1", "МЕН 4/2", "ЕК 4/1"
];

// Мапер для PDF (латиниця)
// Переконайся, що тут ЕК (кирилична Е)
export const GROUP_TRANSLIT: Record<string, string> = {
  "ГРС": "GRS",
  "ТУР": "TUR",
  "КН": "KN",
  "МЕН": "MEN",
  "ПУА": "PUA",
  "ЕК": "EK",   // Кирилична Е
  "EK": "EK",   // Латинська E (про всяк випадок)
  "Деканат": "Dean Office"
};

export const translateGroupName = (group: string) => {
  if (!group) return "";
  
  // Використовуємо регулярку, щоб розбити по пробілу, ігноруючи їх кількість
  const parts = group.trim().split(/\s+/);
  
  if (parts.length < 2) return group; // Якщо назва без номера

  const name = parts[0]; // Назва (ГРС, ЕК...)
  const number = parts[1]; // Номер (1/1, 2/1...)

  return GROUP_TRANSLIT[name] ? `${GROUP_TRANSLIT[name]} ${number}` : group;
};