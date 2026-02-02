/**
 * Date utilities - All date handling goes through here for timezone consistency
 */

/**
 * Get today's date string in local timezone (YYYY-MM-DD format)
 */
export function getLocalDateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get current month string in local timezone (YYYY-MM format)
 */
export function getLocalMonthString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get date N days ago in local timezone
 */
export function getDateDaysAgo(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Check if a date string matches today (local timezone)
 */
export function isToday(dateString) {
  return dateString?.startsWith(getLocalDateString());
}

/**
 * Check if a date string is in the current month (local timezone)
 */
export function isCurrentMonth(dateString) {
  return dateString?.startsWith(getLocalMonthString());
}

/**
 * Get start of day in local timezone
 */
export function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get days remaining in current month
 */
export function getDaysRemainingInMonth() {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return daysInMonth - now.getDate();
}

/**
 * Get current day of month (1-indexed)
 */
export function getCurrentDayOfMonth() {
  return new Date().getDate();
}

/**
 * Get total days in current month
 */
export function getDaysInCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}
