import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { getLocalDateString, getLocalMonthString, getCurrentDayOfMonth, getDaysInCurrentMonth, getDaysRemainingInMonth } from '../utils/dateUtils';

/**
 * SmartInsights - Generates personalized, actionable insights based on spending patterns
 */
export function SmartInsights({ expenses, monthlyBudget, isPremium }) {
  const insights = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const currentMonth = getLocalMonthString();
    const currentDay = getCurrentDayOfMonth();
    const daysInMonth = getDaysInCurrentMonth();
    const daysRemaining = getDaysRemainingInMonth();

    // This month's expenses
    const monthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Last month's expenses for comparison
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = getLocalMonthString(lastMonth);
    const lastMonthExpenses = expenses.filter(e => e.date?.startsWith(lastMonthStr));
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Today's expenses
    const todayStr = getLocalDateString();
    const todayExpenses = expenses.filter(e => e.date?.startsWith(todayStr));
    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown
    const categoryTotals = {};
    monthExpenses.forEach(e => {
      categoryTotals[e.category_id] = (categoryTotals[e.category_id] || 0) + e.amount;
    });
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    const result = [];

    // Daily budget insight
    if (monthlyBudget && monthlyBudget > 0) {
      const dailyBudget = monthlyBudget / daysInMonth;
      const expectedSpend = dailyBudget * currentDay;
      const remainingBudget = monthlyBudget - monthTotal;
      const dailyAllowance = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;

      if (monthTotal < expectedSpend * 0.8) {
        result.push({
          emoji: '🎯',
          text: `On track! You can spend $${(dailyAllowance / 100).toFixed(0)}/day and still hit your goal`,
          type: 'success'
        });
      } else if (monthTotal > expectedSpend * 1.2) {
        result.push({
          emoji: '⚠️',
          text: `Heads up — spending ${Math.round((monthTotal / expectedSpend - 1) * 100)}% faster than planned`,
          type: 'warning'
        });
      } else {
        result.push({
          emoji: '💰',
          text: `Daily allowance: $${(dailyAllowance / 100).toFixed(0)} to stay within budget`,
          type: 'info'
        });
      }
    }

    // Month-over-month comparison
    if (lastMonthTotal > 0 && currentDay > 7) {
      // Compare same period
      const lastMonthSamePeriod = lastMonthExpenses
        .filter(e => new Date(e.date).getDate() <= currentDay)
        .reduce((sum, e) => sum + e.amount, 0);

      if (lastMonthSamePeriod > 0) {
        const diff = ((monthTotal - lastMonthSamePeriod) / lastMonthSamePeriod) * 100;
        if (Math.abs(diff) > 10) {
          result.push({
            emoji: diff > 0 ? '📈' : '📉',
            text: `${Math.abs(diff).toFixed(0)}% ${diff > 0 ? 'more' : 'less'} than this time last month`,
            type: diff > 0 ? 'warning' : 'success'
          });
        }
      }
    }

    // Top category insight
    if (topCategory && monthExpenses.length >= 3) {
      const [catId, catTotal] = topCategory;
      const percentage = Math.round((catTotal / monthTotal) * 100);
      if (percentage >= 40) {
        result.push({
          emoji: getCategoryEmoji(catId),
          text: `${getCategoryName(catId)} is ${percentage}% of your spending`,
          type: 'info'
        });
      }
    }

    // Streak encouragement
    const streak = calculateStreak(expenses);
    if (streak >= 7) {
      result.push({
        emoji: '🔥',
        text: `${streak} day streak! You're building a great habit`,
        type: 'success'
      });
    } else if (streak >= 3 && !todayExpenses.length) {
      result.push({
        emoji: '⏰',
        text: `Don't break your ${streak}-day streak — log something today!`,
        type: 'warning'
      });
    }

    // First week celebration
    if (monthExpenses.length >= 5 && monthExpenses.length <= 10) {
      result.push({
        emoji: '🌟',
        text: `Nice start! ${monthExpenses.length} expenses tracked this month`,
        type: 'success'
      });
    }

    // Spending velocity (if enough data)
    if (monthExpenses.length >= 10) {
      const avgPerExpense = monthTotal / monthExpenses.length;
      const lastFiveAvg = monthExpenses
        .slice(0, 5)
        .reduce((sum, e) => sum + e.amount, 0) / 5;
      
      if (lastFiveAvg > avgPerExpense * 1.5) {
        result.push({
          emoji: '💸',
          text: `Recent expenses are larger than your average`,
          type: 'warning'
        });
      }
    }

    return result.slice(0, 3); // Max 3 insights
  }, [expenses, monthlyBudget]);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-3 rounded-xl p-3 ${
            insight.type === 'success' ? 'bg-success/10 border border-success/20' :
            insight.type === 'warning' ? 'bg-warning/10 border border-warning/20' :
            'bg-surface-raised'
          }`}
        >
          <span className="text-xl">{insight.emoji}</span>
          <span className="text-sm text-text-primary">{insight.text}</span>
        </motion.div>
      ))}
    </div>
  );
}

// Helper functions
function calculateStreak(expenses) {
  if (!expenses || expenses.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysWithExpenses = new Set();
  expenses.forEach(e => {
    const d = new Date(e.date);
    d.setHours(0, 0, 0, 0);
    daysWithExpenses.add(getLocalDateString(d));
  });
  
  let streak = 0;
  let checkDate = new Date(today);
  
  // Check if today has expenses, if not start from yesterday
  if (!daysWithExpenses.has(getLocalDateString(checkDate))) {
    checkDate = new Date(today.getTime() - 86400000);
  }
  
  while (daysWithExpenses.has(getLocalDateString(checkDate))) {
    streak++;
    checkDate = new Date(checkDate.getTime() - 86400000);
  }
  
  return streak;
}

function getCategoryEmoji(id) {
  const emojis = {
    food: '🍔', transport: '🚗', groceries: '🛒', entertainment: '🎬',
    bills: '🏠', shopping: '🛍️', health: '💊', travel: '✈️',
    subscriptions: '📱', other: '📦'
  };
  return emojis[id] || '📦';
}

function getCategoryName(id) {
  const names = {
    food: 'Food', transport: 'Transport', groceries: 'Groceries', 
    entertainment: 'Entertainment', bills: 'Bills', shopping: 'Shopping',
    health: 'Health', travel: 'Travel', subscriptions: 'Subscriptions', other: 'Other'
  };
  return names[id] || 'Other';
}
