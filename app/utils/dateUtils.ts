// Utility functions for date handling

export function toYYYYMM(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export function compareYYYYMM(a: string, b: string): number {
  // Returns -1 if a < b, 0 if equal, 1 if a > b
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function incrementYYYYMM(yyyymm: string): string {
  const [year, month] = yyyymm.split('-').map(Number);
  let newMonth = month + 1;
  let newYear = year;
  if (newMonth > 12) {
    newMonth = 1;
    newYear++;
  }
  return `${newYear.toString().padStart(4, '0')}-${newMonth.toString().padStart(2, '0')}`;
}
