import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { formatCurrency } from '../utils/format';
import { getLocalMonthString, getCurrentDayOfMonth, getDaysInCurrentMonth, getDaysRemainingInMonth } from '../utils/dateUtils';

/**
 * SpendingPredictions - The crystal ball 🔮
 * 
 * Shows users where they're heading based on current spending patterns.
 * This is the "oh shit" or "hell yeah" moment that makes tracking valuable.
 */

export function SpendingPredictions({ expenses, monthlyBudget }) {
  const predictions = useMemo(() => {
    if (!expenses || expenses.length < 3) return null;

    const currentMonth = getLocalMonthString();
    const currentDay = getCurrentDayOfMonth();
    const daysInMonth = getDaysInCurrentMonth();
    const daysRemaining = getDaysRemainingInMonth();
    
    // Guard against division by zero on first day
    if (currentDay === 0) return null;

    // This month's data
    const monthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    if (monthExpenses.length < 3) return null;

    // Calculate spending rate
    const dailyRate = monthTotal / currentDay;
    const projectedMonthTotal = dailyRate * daysInMonth;

    // Get last 7 days trend
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentExpenses = expenses.filter(e => new Date(e.date) >= sevenDaysAgo);
    const recentTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const recentDailyRate = recentTotal / 7;

    // Trend comparison
    const trendMultiplier = dailyRate > 0 ? recentDailyRate / dailyRate : 1;
    const isAccelerating = trendMultiplier > 1.1;
    const isDecelerating = trendMultiplier < 0.9;

    // Adjusted projection based on recent trend
    const adjustedProjection = currentDay < 7 
      ? projectedMonthTotal 
      : (monthTotal + (recentDailyRate * daysRemaining));

    return {
      currentTotal: monthTotal,
      projectedTotal: Math.round(projectedMonthTotal),
      adjustedProjection: Math.round(adjustedProjection),
      dailyRate: Math.round(dailyRate),
      recentDailyRate: Math.round(recentDailyRate),
      daysRemaining,
      isAccelerating,
      isDecelerating,
      trendMultiplier,
      budget: monthlyBudget,
      onTrack: monthlyBudget ? projectedMonthTotal <= monthlyBudget : null,
      percentOfBudget: monthlyBudget ? Math.round((projectedMonthTotal / monthlyBudget) * 100) : null,
    };
  }, [expenses, monthlyBudget]);

  if (!predictions) return null;

  const { 
    projectedTotal, 
    adjustedProjection,
    dailyRate,
    daysRemaining,
    isAccelerating,
    isDecelerating,
    budget,
    onTrack,
    percentOfBudget
  } = predictions;

  // Determine the vibe
  let emoji, message, type;
  
  if (budget) {
    if (percentOfBudget <= 80) {
      emoji = '🎯';
      message = `On pace to finish at ${formatCurrency(projectedTotal)} — ${100 - percentOfBudget}% under budget!`;
      type = 'success';
    } else if (percentOfBudget <= 100) {
      emoji = '⚡';
      message = `Projected: ${formatCurrency(projectedTotal)} — cutting it close to your ${formatCurrency(budget)} budget`;
      type = 'warning';
    } else {
      emoji = '🚨';
      message = `At this pace, you'll hit ${formatCurrency(projectedTotal)} — ${percentOfBudget - 100}% over budget`;
      type = 'danger';
    }
  } else {
    emoji = '📊';
    message = `At current pace: ${formatCurrency(projectedTotal)} this month`;
    type = 'info';
  }

  // Add trend context
  let trendMessage = null;
  if (isAccelerating) {
    trendMessage = "📈 Spending picked up recently";
  } else if (isDecelerating) {
    trendMessage = "📉 Nice! Spending slowing down";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Main Prediction Card */}
      <div className={`rounded-2xl p-4 ${
        type === 'success' ? 'bg-success/10 border border-success/20' :
        type === 'warning' ? 'bg-warning/10 border border-warning/20' :
        type === 'danger' ? 'bg-danger/10 border border-danger/20' :
        'bg-surface-raised'
      }`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{emoji}</span>
          <div className="flex-1">
            <p className="text-text-primary font-medium">{message}</p>
            {trendMessage && (
              <p className="text-text-secondary text-sm mt-1">{trendMessage}</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between mt-4 pt-3 border-t border-white/10">
          <div className="text-center">
            <div className="text-text-muted text-xs uppercase tracking-wide">Daily Avg</div>
            <div className="text-text-primary font-semibold">{formatCurrency(dailyRate)}</div>
          </div>
          <div className="text-center">
            <div className="text-text-muted text-xs uppercase tracking-wide">Days Left</div>
            <div className="text-text-primary font-semibold">{daysRemaining}</div>
          </div>
          {budget && daysRemaining > 0 && (
            <div className="text-center">
              <div className="text-text-muted text-xs uppercase tracking-wide">Safe to Spend</div>
              <div className={`font-semibold ${
                (budget - predictions.currentTotal) / daysRemaining > dailyRate 
                  ? 'text-success' 
                  : 'text-warning'
              }`}>
                {formatCurrency(Math.max(0, (budget - predictions.currentTotal) / daysRemaining))}/day
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * MiniPrediction - A compact one-liner for tight spaces
 */
export function MiniPrediction({ expenses, monthlyBudget }) {
  const prediction = useMemo(() => {
    if (!expenses || expenses.length < 3 || !monthlyBudget) return null;

    const currentMonth = getLocalMonthString();
    const currentDay = getCurrentDayOfMonth();
    const daysInMonth = getDaysInCurrentMonth();

    // Guard against division by zero
    if (currentDay === 0) return null;

    const monthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    if (monthExpenses.length < 3) return null;

    const dailyRate = monthTotal / currentDay;
    const projectedTotal = dailyRate * daysInMonth;
    const diff = projectedTotal - monthlyBudget;

    return {
      over: diff > 0,
      amount: Math.abs(diff),
      percentage: Math.round((diff / monthlyBudget) * 100),
    };
  }, [expenses, monthlyBudget]);

  if (!prediction) return null;

  return (
    <span className={`text-sm ${prediction.over ? 'text-danger' : 'text-success'}`}>
      {prediction.over ? '📈' : '📉'} Heading {formatCurrency(prediction.amount)} {prediction.over ? 'over' : 'under'} budget
    </span>
  );
}

/**
 * WeeklyComparison - "You spent X% less than last week!"
 */
export function WeeklyComparison({ expenses }) {
  const comparison = useMemo(() => {
    if (!expenses || expenses.length < 7) return null;

    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= thisWeekStart;
    });

    const lastWeek = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= lastWeekStart && d < thisWeekStart;
    });

    if (lastWeek.length === 0) return null;

    const thisWeekTotal = thisWeek.reduce((sum, e) => sum + e.amount, 0);
    const lastWeekTotal = lastWeek.reduce((sum, e) => sum + e.amount, 0);

    const diff = thisWeekTotal - lastWeekTotal;
    const percentChange = Math.round((diff / lastWeekTotal) * 100);

    return {
      thisWeek: thisWeekTotal,
      lastWeek: lastWeekTotal,
      diff,
      percentChange,
      improved: diff < 0,
    };
  }, [expenses]);

  if (!comparison) return null;

  const { percentChange, improved } = comparison;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center p-3 rounded-xl ${
        improved ? 'bg-success/10' : 'bg-surface-raised'
      }`}
    >
      <span className="text-2xl mr-2">{improved ? '🎉' : '📊'}</span>
      <span className={`text-sm ${improved ? 'text-success' : 'text-text-secondary'}`}>
        {improved 
          ? `You spent ${Math.abs(percentChange)}% less than last week!`
          : `Spending up ${percentChange}% vs last week`
        }
      </span>
    </motion.div>
  );
}
