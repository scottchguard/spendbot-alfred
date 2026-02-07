import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import {
  getMonthlyTotal,
  getRecentExpenses,
  getCategories,
  getSettings,
  getTodayStats,
  getWeekStats,
  getStreak,
  Expense,
  Category,
  UserSettings,
} from '../db';
import AnimatedNumber from '../components/AnimatedNumber';
import ExpenseItem from '../components/ExpenseItem';
import { EmptyStates } from '../components/EmptyState';

export default function Dashboard() {
  const navigate = useNavigate();
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [todayStats, setTodayStats] = useState({ total: 0, count: 0 });
  const [weekStats, setWeekStats] = useState({ total: 0, count: 0 });
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Days remaining in month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = lastDay - now.getDate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [total, expenses, cats, userSettings, today, week, streakVal] = await Promise.all([
      getMonthlyTotal(now.getFullYear(), now.getMonth()),
      getRecentExpenses(5),
      getCategories(),
      getSettings(),
      getTodayStats(),
      getWeekStats(),
      getStreak(),
    ]);
    setMonthlyTotal(total);
    setRecentExpenses(expenses);
    setCategories(cats);
    setSettings(userSettings || null);
    setTodayStats(today);
    setWeekStats(week);
    setStreak(streakVal);
    setIsLoading(false);
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings?.currency || 'USD',
    }).format(cents / 100);
  };

  const budgetProgress = settings?.monthlyBudget
    ? Math.min((monthlyTotal / settings.monthlyBudget) * 100, 100)
    : null;

  const budgetStatus =
    budgetProgress && budgetProgress >= 100
      ? 'danger'
      : budgetProgress && budgetProgress >= 80
        ? 'warning'
        : 'normal';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-bounce">🤖</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between p-4"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">{monthName}</h1>
          <div className="text-sm text-text-secondary flex items-center gap-2">
            {daysRemaining} days left
            {streak > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
                🔥 {streak} day streak
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface text-xl transition-colors active:bg-surface-elevated"
            aria-label="Robot buddy"
          >
            🤖
          </button>
          <Link
            to="/history"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface text-xl transition-colors active:bg-surface-elevated"
            aria-label="Calendar"
          >
            📅
          </Link>
          <Link
            to="/settings"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface text-xl transition-colors active:bg-surface-elevated"
            aria-label="Settings"
          >
            ⚙️
          </Link>
        </div>
      </motion.header>

      {/* ZONE 1: Hero Total */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center py-8 px-4"
      >
        <motion.div
          className="text-[4rem] font-extrabold leading-none mb-4 font-display"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.03em',
          }}
          key={monthlyTotal}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <AnimatedNumber value={monthlyTotal / 100} prefix="$" />
        </motion.div>

        {/* Budget Progress */}
        {budgetProgress !== null && settings?.monthlyBudget && (
          <div className="max-w-[280px] mx-auto">
            <div className="h-2 bg-surface-elevated rounded overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetProgress}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded ${
                  budgetStatus === 'danger'
                    ? 'bg-gradient-to-r from-danger to-danger-muted'
                    : budgetStatus === 'warning'
                      ? 'bg-gradient-to-r from-warning to-warning-muted'
                      : 'bg-gradient-to-br from-accent to-[#8B5CF6]'
                }`}
              />
            </div>
            <p className="text-sm text-text-secondary">
              {formatCurrency(settings.monthlyBudget)} budget
            </p>
          </div>
        )}
      </motion.section>

      {/* ZONE 2: Quick Stats */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 px-4 mb-6"
      >
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-surface-raised rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📅</span>
            <span className="text-sm font-medium text-text-secondary">Today</span>
          </div>
          <div className="text-2xl font-bold text-text-primary mb-1">
            {formatCurrency(todayStats.total)}
          </div>
          <div className="text-xs text-text-muted">
            {todayStats.count} expense{todayStats.count !== 1 ? 's' : ''}
          </div>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-surface-raised rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📆</span>
            <span className="text-sm font-medium text-text-secondary">This Week</span>
          </div>
          <div className="text-2xl font-bold text-text-primary mb-1">
            {formatCurrency(weekStats.total)}
          </div>
          <div className="text-xs text-text-muted">
            {weekStats.count} expense{weekStats.count !== 1 ? 's' : ''}
          </div>
        </motion.div>
      </motion.section>

      {/* ZONE 3: Recent Transactions */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-text-primary">Recent</h3>
          {recentExpenses.length > 0 && (
            <Link
              to="/history"
              className="text-sm text-accent flex items-center gap-1 hover:text-accent-hover transition-colors"
            >
              See All →
            </Link>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          EmptyStates.noExpenses(() => navigate('/add'))
        ) : (
          <div className="bg-surface-raised rounded-2xl overflow-hidden">
            <AnimatePresence>
              {recentExpenses.map((expense, index) => {
                const category = categories.find(
                  (c) => c.id === expense.categoryId
                );
                return (
                  <motion.button
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    onClick={() => navigate(`/edit/${expense.id}`)}
                    className="w-full flex items-center p-3 pr-4 border-b border-surface-elevated last:border-b-0 active:bg-surface-elevated transition-colors"
                    style={{
                      borderLeftWidth: '3px',
                      borderLeftColor: category?.color || '#6366F1',
                    }}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-surface rounded-[10px] text-xl mr-3">
                      {category?.emoji || '📦'}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[0.9375rem] font-medium text-text-primary">
                        {category?.name || 'Other'}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {expense.note && `${expense.note} • `}
                        {formatTime(expense.date)}
                      </div>
                    </div>
                    <div className="text-base font-semibold text-text-primary text-right">
                      -{formatCurrency(expense.amount)}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 25 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/add')}
        className="fixed left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl z-50"
        style={{
          bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4), 0 0 0 4px rgba(99, 102, 241, 0.1)',
        }}
        aria-label="Add expense"
      >
        +
      </motion.button>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return time;
  if (isYesterday) return `Yesterday`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
