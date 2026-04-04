export const ALL_GROUPS = [
  "ГРС 1/1", "ТУР 1/1", "КН 1/1", "МЕН 1/1", "МЕН 1/2", "МЕН 1/3", "ПУА 1/1",
  "ГРС 2/1", "ТУР 2/1", "КН 2/1", "КН 2/2", "МЕН 2/1", "МЕН 2/2", "МЕН 2/3", "ПУА 2/1", "ЕК 2/1",
  "ГРС 3/1", "ТУР 3/1", "КН 3/1", "МЕН 3/1", "МЕН 3/2", "ЕК 3/1",
  "ГРС 4/1", "ТУР 4/1", "КН 4/1", "МЕН 4/1", "МЕН 4/2", "ЕК 4/1"
];

// Мапер для PDF (латиниця)
export const GROUP_TRANSLIT: Record<string, string> = {
  "ГРС": "GRS",
  "ТУР": "TUR",
  "КН": "KN",
  "МЕН": "MEN",
  "ПУА": "PUA",
  "EK": "EK",
  "Деканат": "Dean Office"
};

// Функція для конвертації назви групи
export const translateGroupName = (group: string) => {
  const [name, number] = group.split(' ');
  return GROUP_TRANSLIT[name] ? `${GROUP_TRANSLIT[name]} ${number}` : group;
};