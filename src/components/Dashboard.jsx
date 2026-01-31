import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatTime, getCurrentMonthName } from '../utils/format';

function AnimatedNumber({ value, className }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 600;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span className={className}>{formatCurrency(displayValue)}</span>;
}

function CategoryBar({ category, amount, maxAmount }) {
  const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-shrink-0 w-28 p-3 bg-surface-raised rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{category.emoji}</span>
        <span className="text-xs text-text-secondary truncate">{category.name}</span>
      </div>
      <div className="text-sm font-semibold text-text-primary mb-2">
        {formatCurrency(amount)}
      </div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: category.color }}
        />
      </div>
    </motion.div>
  );
}

function ExpenseItem({ expense, category }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-3 px-4 bg-surface-raised rounded-xl"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{category?.emoji || '📦'}</span>
        <div>
          <div className="text-text-primary font-medium">
            {category?.name || 'Other'}
          </div>
          <div className="text-xs text-text-muted">
            {formatTime(expense.date)}
          </div>
        </div>
      </div>
      <div className="text-text-primary font-semibold">
        -{formatCurrency(expense.amount)}
      </div>
    </motion.div>
  );
}

export function Dashboard({ 
  monthTotal, 
  expenses, 
  categories, 
  categoryTotals,
  settings,
  monthCount,
  onAddClick 
}) {
  const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 1);
  const recentExpenses = expenses.slice(0, 5);
  
  const budgetPercentage = settings?.monthlyBudget 
    ? Math.min((monthTotal / settings.monthlyBudget) * 100, 100)
    : null;

  const categoriesWithTotals = categories
    .map(cat => ({ ...cat, total: categoryTotals[cat.id] || 0 }))
    .filter(cat => cat.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-heading font-semibold text-text-primary">
            {getCurrentMonthName()}
          </h1>
          <button className="text-text-secondary text-2xl">⚙️</button>
        </div>

        {/* Monthly Total */}
        <div className="text-center mb-6">
          <AnimatedNumber
            value={monthTotal}
            className="font-display text-5xl md:text-6xl font-bold text-text-primary"
          />
          <p className="text-text-secondary mt-2">This Month</p>
        </div>

        {/* Budget Progress */}
        {budgetPercentage !== null && (
          <div className="mb-6">
            <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetPercentage}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`h-full rounded-full ${
                  budgetPercentage >= 100 ? 'bg-danger' : 
                  budgetPercentage >= 80 ? 'bg-warning' : 'bg-accent'
                }`}
              />
            </div>
            <p className="text-xs text-text-muted mt-2 text-center">
              {Math.round(budgetPercentage)}% of {formatCurrency(settings.monthlyBudget)} budget
            </p>
          </div>
        )}

        {/* Free tier counter */}
        {!settings?.isPremium && (
          <div className="text-center text-sm text-text-muted mb-4">
            {monthCount}/50 expenses this month
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {categoriesWithTotals.length > 0 && (
        <div className="mb-6">
          <h2 className="px-6 text-sm font-semibold text-text-secondary mb-3">
            Spending by Category
          </h2>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-6">
              {categoriesWithTotals.map((cat, i) => (
                <CategoryBar
                  key={cat.id}
                  category={cat}
                  amount={cat.total}
                  maxAmount={maxCategoryAmount}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="px-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">
          Recent
        </h2>
        {recentExpenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-text-secondary">No expenses yet!</p>
            <p className="text-text-muted text-sm mt-1">
              Tap the + button to track your first purchase.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((expense, i) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                category={categories.find(c => c.id === expense.categoryId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        onClick={onAddClick}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 
                   bg-accent rounded-full flex items-center justify-center
                   text-3xl text-white shadow-lg fab-glow"
      >
        +
      </motion.button>
    </div>
  );
}
