// src/utils/date.ts

export function todayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function formatShortDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
