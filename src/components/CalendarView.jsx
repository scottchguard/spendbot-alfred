import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarGrid } from './CalendarGrid';
import { DayDetailModal } from './DayDetailModal';
import { RobotBuddy } from './RobotBuddy';
import { GlassCard, AnimatedBackground, NoiseTexture } from './ui';
import { formatCurrency } from '../utils/format';
import { playSound } from '../utils/sounds';
import { haptic } from '../utils/haptics';

/**
 * CalendarView - Heat map calendar for viewing spending history
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Robot commentary for month summary
const MONTH_MESSAGES = {
  excellent: [
    "Look at all that green! You're a budgeting legend. 💚",
    "This month was *chef's kiss* financially.",
    "Your wallet thanks you for this month.",
    "Green machine! Keep this energy.",
  ],
  good: [
    "Solid month! More green than red. I approve.",
    "Not bad at all! You're doing great.",
    "A pretty responsible month overall!",
    "Looking good! Keep it up.",
  ],
  mixed: [
    "A tale of two budgets. Some highs, some lows.",
    "Mixed bag this month. Room for improvement!",
    "Some wins, some... learning opportunities.",
    "The rainbow of spending. At least it's colorful?",
  ],
  rough: [
    "This month was... a journey. We'll do better.",
    "Red alert! But hey, new month = fresh start.",
    "What happened here? Actually, don't tell me.",
    "Budget took some hits. Recovery mode: activated.",
  ],
  current: [
    "Month's not over yet! Still time to shine.",
    "Work in progress. Let's finish strong!",
    "The month is young. Make it count!",
    "Still writing this chapter. Make it a good one!",
  ],
};

function getMonthSummaryMessage(greenDays, redDays, totalDays, isCurrentMonth) {
  if (isCurrentMonth) {
    const messages = MONTH_MESSAGES.current;
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  const greenRatio = greenDays / totalDays;
  const redRatio = redDays / totalDays;
  
  let category;
  if (greenRatio > 0.6) category = 'excellent';
  else if (greenRatio > 0.4) category = 'good';
  else if (redRatio > 0.5) category = 'rough';
  else category = 'mixed';
  
  const messages = MONTH_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getMoodForMonth(greenDays, redDays, totalDays) {
  const greenRatio = greenDays / totalDays;
  if (greenRatio > 0.6) return 'happy';
  if (greenRatio > 0.3) return 'neutral';
  return 'worried';
}

export function CalendarView({
  expenses,
  categories,
  settings,
  onClose,
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  // Calculate daily totals and counts
  const { dailyTotals, dailyCounts } = useMemo(() => {
    const totals = {};
    const counts = {};
    
    expenses.forEach(exp => {
      const dateKey = exp.date?.split('T')[0];
      if (dateKey) {
        totals[dateKey] = (totals[dateKey] || 0) + exp.amount;
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      }
    });
    
    return { dailyTotals: totals, dailyCounts: counts };
  }, [expenses]);

  // Calculate stats for current view month
  const monthStats = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    const activeDays = isCurrentMonth ? now.getDate() : daysInMonth;
    
    let monthTotal = 0;
    let greenDays = 0;
    let redDays = 0;
    let zeroDays = 0;
    let bestDay = { date: null, amount: Infinity };
    let worstDay = { date: null, amount: 0 };
    
    const dailyBudget = settings?.monthlyBudget 
      ? settings.monthlyBudget / daysInMonth 
      : null;
    
    // Calculate average daily spend for baseline
    const allTotals = Object.values(dailyTotals);
    const avgDaily = allTotals.length > 0 
      ? allTotals.reduce((a, b) => a + b, 0) / allTotals.length 
      : 50;
    
    for (let day = 1; day <= activeDays; day++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTotal = dailyTotals[dateKey] || 0;
      
      monthTotal += dayTotal;
      
      if (dayTotal === 0) {
        zeroDays++;
        greenDays++;
        if (bestDay.amount > 0) {
          bestDay = { date: dateKey, amount: 0 };
        }
      } else {
        const baseline = dailyBudget || avgDaily;
        const percentage = (dayTotal / baseline) * 100;
        
        if (percentage < 50) greenDays++;
        if (percentage > 100) redDays++;
        
        if (dayTotal < bestDay.amount) {
          bestDay = { date: dateKey, amount: dayTotal };
        }
        if (dayTotal > worstDay.amount) {
          worstDay = { date: dateKey, amount: dayTotal };
        }
      }
    }
    
    return {
      monthTotal,
      greenDays,
      redDays,
      zeroDays,
      bestDay,
      worstDay,
      activeDays,
      dailyBudget,
      avgDaily,
      isCurrentMonth,
    };
  }, [viewYear, viewMonth, dailyTotals, settings?.monthlyBudget, now]);

  // Navigation
  const goToPrevMonth = () => {
    playSound('tap');
    haptic('light');
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isCurrentMonth) return; // Can't go to future
    
    playSound('tap');
    haptic('light');
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    playSound('tap');
    haptic('light');
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const handleSelectDate = (dateStr, date) => {
    playSound('tap');
    haptic('medium');
    setSelectedDate(dateStr);
    setShowDayModal(true);
  };

  const isCurrentViewMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const canGoNext = !isCurrentViewMonth;
  
  const summaryMessage = getMonthSummaryMessage(
    monthStats.greenDays, 
    monthStats.redDays, 
    monthStats.activeDays,
    monthStats.isCurrentMonth
  );
  const summaryMood = getMoodForMonth(monthStats.greenDays, monthStats.redDays, monthStats.activeDays);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40"
    >
      <AnimatedBackground variant="mesh" intensity="low" className="min-h-screen">
        <NoiseTexture opacity={0.02} />
        
        <div className="pb-8 px-4 pt-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
            >
              <span className="text-xl">←</span>
            </motion.button>
            
            <div className="text-center">
              <h1 className="text-xl font-heading font-bold text-text-primary">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h1>
            </div>
            
            {!isCurrentViewMonth ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goToToday}
                className="px-3 py-2 rounded-xl bg-accent/20 text-accent text-sm font-medium"
              >
                Today
              </motion.button>
            ) : (
              <div className="w-10" />
            )}
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={goToPrevMonth}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
            >
              <span className="text-lg">‹</span>
            </motion.button>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(monthStats.monthTotal)}
              </p>
              <p className="text-sm text-text-muted">
                spent this month
              </p>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={goToNextMonth}
              disabled={!canGoNext}
              className={`w-10 h-10 rounded-xl flex items-center justify-center
                ${canGoNext ? 'bg-white/10' : 'bg-white/5 opacity-30'}`}
            >
              <span className="text-lg">›</span>
            </motion.button>
          </div>

          {/* Calendar Grid */}
          <GlassCard className="mb-4">
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              dailyTotals={dailyTotals}
              dailyCounts={dailyCounts}
              dailyBudget={monthStats.dailyBudget}
              avgDaily={monthStats.avgDaily}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          </GlassCard>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/40" />
              <span className="text-xs text-text-muted">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-yellow-400/40" />
              <span className="text-xs text-text-muted">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-orange-400/40" />
              <span className="text-xs text-text-muted">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500/50" />
              <span className="text-xs text-text-muted">Over</span>
            </div>
          </div>

          {/* Month Summary */}
          <GlassCard className="mb-4">
            <div className="flex items-center gap-4">
              <RobotBuddy mood={summaryMood} size="md" />
              <div className="flex-1">
                <p className="text-sm text-text-secondary">{summaryMessage}</p>
                <div className="flex gap-4 mt-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-400">{monthStats.zeroDays}</p>
                    <p className="text-xs text-text-muted">$0 days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-text-primary">{monthStats.greenDays}</p>
                    <p className="text-xs text-text-muted">Good days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-400">{monthStats.redDays}</p>
                    <p className="text-xs text-text-muted">Over budget</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Best/Worst Days */}
          {(monthStats.bestDay.date || monthStats.worstDay.date) && (
            <div className="grid grid-cols-2 gap-3">
              {monthStats.bestDay.date && (
                <GlassCard variant="success" padding="sm">
                  <p className="text-xs text-text-muted mb-1">Best Day</p>
                  <p className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(monthStats.bestDay.amount)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(monthStats.bestDay.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </GlassCard>
              )}
              {monthStats.worstDay.date && monthStats.worstDay.amount > 0 && (
                <GlassCard variant="danger" padding="sm">
                  <p className="text-xs text-text-muted mb-1">Biggest Day</p>
                  <p className="text-sm font-semibold text-red-400">
                    {formatCurrency(monthStats.worstDay.amount)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(monthStats.worstDay.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </AnimatedBackground>

      {/* Day Detail Modal */}
      <DayDetailModal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        dateStr={selectedDate}
        expenses={expenses}
        categories={categories}
        dailyBudget={monthStats.dailyBudget}
        avgDaily={monthStats.avgDaily}
      />
    </motion.div>
  );
}

export default CalendarView;
