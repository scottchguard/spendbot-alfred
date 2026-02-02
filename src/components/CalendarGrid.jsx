import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDay } from './CalendarDay';

/**
 * Month grid component - renders 6 weeks of days
 */

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Get all days to display for a month (including padding from prev/next months)
function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  const days = [];
  
  // Add empty slots for days before the 1st
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
    days.push({
      day: prevMonthDay.getDate(),
      date: prevMonthDay,
      isCurrentMonth: false,
    });
  }
  
  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }
  
  // Add days from next month to fill grid (always 42 cells = 6 weeks)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthDay = new Date(year, month + 1, i);
    days.push({
      day: i,
      date: nextMonthDay,
      isCurrentMonth: false,
    });
  }
  
  return days;
}

// Format date to YYYY-MM-DD for expense lookup
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CalendarGrid({
  year,
  month,
  dailyTotals,
  dailyCounts,
  dailyBudget,
  avgDaily,
  selectedDate,
  onSelectDate,
}) {
  const today = new Date();
  const todayKey = formatDateKey(today);
  
  const calendarDays = useMemo(() => {
    return getCalendarDays(year, month);
  }, [year, month]);

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs text-text-muted font-medium py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <motion.div 
        className="grid grid-cols-7 gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {calendarDays.map((dayInfo, index) => {
          const dateKey = formatDateKey(dayInfo.date);
          const total = dailyTotals[dateKey] || 0;
          const count = dailyCounts[dateKey] || 0;
          const isToday = dateKey === todayKey;
          const isFuture = dayInfo.date > today;
          const isSelected = selectedDate === dateKey;
          
          return (
            <motion.div
              key={`${dateKey}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01, duration: 0.2 }}
            >
              <CalendarDay
                day={dayInfo.day}
                isCurrentMonth={dayInfo.isCurrentMonth}
                isToday={isToday}
                isFuture={isFuture}
                isSelected={isSelected}
                total={total}
                transactionCount={count}
                dailyBudget={dailyBudget}
                avgDaily={avgDaily}
                onSelect={() => onSelectDate(dateKey, dayInfo.date)}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default CalendarGrid;
