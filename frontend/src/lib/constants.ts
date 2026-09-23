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

// Category suggestions (the field accepts any text).
export const CATEGORIES = [
  "ведущий",
  "фотограф",
  "видеограф",
  "кейтеринг",
  "декор",
  "музыканты",
  "DJ",
  "артисты",
  "аниматор",
  "площадка",
] as const;

export const LANGUAGES = [
  { value: "русский", label: "Русский" },
  { value: "казахский", label: "Қазақша" },
  { value: "английский", label: "English" },
] as const;

export const formatKzt = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₸";
