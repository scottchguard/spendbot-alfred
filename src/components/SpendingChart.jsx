import { motion } from 'framer-motion';
import { useMemo } from 'react';

/**
 * WeeklyChart - Visual spending breakdown by day of week
 */
export function WeeklyChart({ expenses }) {
  const weekData = useMemo(() => {
    if (!expenses || expenses.length === 0) return null;

    // Get last 7 days
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().slice(0, 10);
      
      const dayExpenses = expenses.filter(e => e.date.startsWith(dateStr));
      const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      days.push({
        name: dayNames[date.getDay()],
        date: date.getDate(),
        total,
        isToday: i === 0
      });
    }

    const maxTotal = Math.max(...days.map(d => d.total), 1);
    
    return { days, maxTotal };
  }, [expenses]);

  if (!weekData || weekData.days.every(d => d.total === 0)) {
    return null;
  }

  return (
    <div className="bg-surface-raised rounded-2xl p-4 mb-6">
      <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">
        Last 7 Days
      </h3>
      
      <div className="flex items-end justify-between gap-2 h-24">
        {weekData.days.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(day.total / weekData.maxTotal) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`w-full rounded-t-lg min-h-[4px] ${
                day.isToday 
                  ? 'bg-gradient-to-t from-accent to-purple-500' 
                  : day.total > 0 
                    ? 'bg-accent/50' 
                    : 'bg-border'
              }`}
            />
            <span className={`text-xs ${day.isToday ? 'text-accent font-bold' : 'text-text-muted'}`}>
              {day.name}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between text-xs text-text-muted">
        <span>
          Weekly total: ${(weekData.days.reduce((s, d) => s + d.total, 0) / 100).toFixed(2)}
        </span>
        <span>
          Daily avg: ${(weekData.days.reduce((s, d) => s + d.total, 0) / 7 / 100).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

/**
 * CategoryBreakdown - Visual category spending with progress bars
 */
export function CategoryBreakdown({ categoryTotals, monthTotal }) {
  if (!categoryTotals || categoryTotals.length === 0) return null;

  const maxTotal = Math.max(...categoryTotals.map(c => c.total));

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
        Spending by Category
      </h3>
      
      <div className="space-y-3">
        {categoryTotals.slice(0, 5).map((cat, i) => {
          const percentage = Math.round((cat.total / monthTotal) * 100);
          
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-raised rounded-xl p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  <span className="text-text-primary font-medium">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-text-primary font-semibold">
                    ${(cat.total / 100).toFixed(2)}
                  </span>
                  <span className="text-text-muted text-xs ml-1">
                    ({percentage}%)
                  </span>
                </div>
              </div>
              
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.total / maxTotal) * 100}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * SpendingPace - Shows if user is on track with budget
 */
export function SpendingPace({ monthTotal, monthlyBudget, daysInMonth, currentDay }) {
  if (!monthlyBudget || monthlyBudget <= 0) return null;

  const expectedSpend = (monthlyBudget / daysInMonth) * currentDay;
  const actualSpend = monthTotal;
  const diff = actualSpend - expectedSpend;
  const percentDiff = Math.round((diff / expectedSpend) * 100);
  
  const isOnTrack = diff <= 0;
  const isClose = Math.abs(percentDiff) <= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 mb-4 ${
        isOnTrack 
          ? 'bg-success/10 border border-success/20' 
          : isClose 
            ? 'bg-warning/10 border border-warning/20'
            : 'bg-danger/10 border border-danger/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {isOnTrack ? '✅' : isClose ? '⚡' : '⚠️'}
          </span>
          <div>
            <div className="text-text-primary font-medium">
              {isOnTrack ? 'On Track' : isClose ? 'Slightly Over' : 'Over Budget'}
            </div>
            <div className="text-xs text-text-secondary">
              {isOnTrack 
                ? `$${((expectedSpend - actualSpend) / 100).toFixed(0)} under pace`
                : `$${(diff / 100).toFixed(0)} over pace`
              }
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-text-muted">Budget pace</div>
          <div className={`font-bold ${isOnTrack ? 'text-success' : isClose ? 'text-warning' : 'text-danger'}`}>
            {isOnTrack ? '👍' : `+${percentDiff}%`}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
