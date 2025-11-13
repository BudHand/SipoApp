// utils/date.ts
export function formatTanggalID(value: string | Date): string {
  const dateObj = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long", // Senin
    day: "numeric",  // 29
    month: "long",   // September
    year: "numeric", // 2025
  }).format(dateObj);
}
export function formatWaktuID(value: string | Date): string {
  const dateObj = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",   // 14
    minute: "2-digit", // 30
  }).format(dateObj);
}