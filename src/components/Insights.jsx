import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/format';

function getInsights(expenses, categories, monthTotal, streakInfo) {
  const insights = [];
  
  if (expenses.length === 0) {
    return [{ emoji: '👋', text: 'Add your first expense to get personalized insights!' }];
  }

  // Streak insights
  if (streakInfo?.currentStreak >= 7) {
    insights.push({ 
      emoji: '🏆', 
      text: `Incredible! ${streakInfo.currentStreak}-day tracking streak!`,
      type: 'success'
    });
  } else if (streakInfo?.currentStreak >= 3) {
    insights.push({ 
      emoji: '🔥', 
      text: `${streakInfo.currentStreak} days and counting. Keep it up!`,
      type: 'success'
    });
  }

  // Category analysis
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
  });
  
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);
  
  if (sortedCategories.length > 0) {
    const [topCatId, topAmount] = sortedCategories[0];
    const topCat = categories.find(c => c.id === topCatId);
    const percentage = Math.round((topAmount / monthTotal) * 100);
    
    if (percentage >= 50) {
      insights.push({
        emoji: topCat?.emoji || '📊',
        text: `${topCat?.name || 'One category'} is ${percentage}% of your spending`,
        type: 'warning'
      });
    } else if (topCat) {
      insights.push({
        emoji: topCat.emoji,
        text: `Top category: ${topCat.name} (${formatCurrency(topAmount)})`,
        type: 'info'
      });
    }
  }

  // Spending patterns
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const projectedTotal = (monthTotal / dayOfMonth) * daysInMonth;
  
  if (dayOfMonth > 7 && monthTotal > 0) {
    insights.push({
      emoji: '📈',
      text: `On pace for ${formatCurrency(projectedTotal)} this month`,
      type: 'info'
    });
  }

  // Daily average
  if (expenses.length >= 5) {
    const avgPerExpense = monthTotal / expenses.length;
    insights.push({
      emoji: '💡',
      text: `Average expense: ${formatCurrency(avgPerExpense)}`,
      type: 'info'
    });
  }

  // Motivational
  if (expenses.length === 1) {
    insights.push({
      emoji: '🎉',
      text: 'First expense logged! You\'re on your way.',
      type: 'success'
    });
  }

  return insights.slice(0, 2); // Max 2 insights
}

export function Insights({ expenses, categories, monthTotal, streakInfo }) {
  const insights = useMemo(
    () => getInsights(expenses, categories, monthTotal, streakInfo),
    [expenses, categories, monthTotal, streakInfo]
  );

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
            insight.type === 'success' ? 'bg-success/10 border border-success/20' :
            insight.type === 'warning' ? 'bg-warning/10 border border-warning/20' :
            'bg-surface-raised'
          }`}
        >
          <span className="text-xl">{insight.emoji}</span>
          <span className="text-sm text-text-secondary">{insight.text}</span>
        </motion.div>
      ))}
    </div>
  );
}
