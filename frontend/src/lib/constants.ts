// Form dictionaries. Values are sent to the backend as-is: sync them with the dataset.

export const CITIES = ["Алматы", "Астана", "Зарубежье"] as const;

export const EVENT_TYPES = [
  "свадьба",
  "той",
  "корпоратив",
  "конференция",
  "юбилей",
  "день рождения",
] as const;

// Categories from the dataset (the backend matches them exactly, case-insensitive).
export const CATEGORIES = [
  "Ведущий",
  "Ведущий церемонии",
  "Фотограф",
  "Видеограф",
  "Фото и видеобудки",
  "Банкетный зал",
  "Ресторан",
  "Загородная площадка",
  "Отель",
  "Лайв-бэнд",
  "Шоу-программа",
  "Национальный ансамбль",
  "Танцевальный коллектив",
  "Инструменталист",
  "Декоратор",
  "Флорист",
  "Подарки и сувениры",
] as const;

export const LANGUAGES = [
  { value: "русский", label: "Русский" },
  { value: "казахский", label: "Қазақша" },
  { value: "английский", label: "English" },
] as const;

export const formatKzt = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₸";
