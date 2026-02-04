import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus } from 'lucide-react';
import { getMonthlyTotal, getRecentExpenses, getExpensesByCategory, getCategories, getSettings, Expense, Category, UserSettings } from '../db';
import AnimatedNumber from '../components/AnimatedNumber';
import CategoryPill from '../components/CategoryPill';
import ExpenseItem from '../components/ExpenseItem';

export default function Dashboard() {
  const navigate = useNavigate();
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [total, expenses, byCategory, cats, userSettings] = await Promise.all([
      getMonthlyTotal(now.getFullYear(), now.getMonth()),
      getRecentExpenses(5),
      getExpensesByCategory(now.getFullYear(), now.getMonth()),
      getCategories(),
      getSettings(),
    ]);
    setMonthlyTotal(total);
    setRecentExpenses(expenses);
    setCategoryTotals(byCategory);
    setCategories(cats);
    setSettings(userSettings || null);
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

  // Get categories with spending
  const activeCategories = categories.filter(cat => categoryTotals[cat.id] > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-bounce">🤖</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6"
      >
        <h1 className="text-xl font-semibold text-text-primary font-heading">{monthName}</h1>
        <Link to="/settings" className="p-2 rounded-full hover:bg-surface transition-colors">
          <Settings className="w-6 h-6 text-text-secondary" />
        </Link>
      </motion.header>

      {/* Main Total */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 py-8 text-center"
      >
        <div className="text-5xl md:text-6xl font-bold font-display text-text-primary mb-2">
          <AnimatedNumber value={monthlyTotal / 100} prefix="$" />
        </div>
        <p className="text-text-secondary">This Month</p>

        {/* Budget Progress */}
        {budgetProgress !== null && settings?.monthlyBudget && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            transition={{ delay: 0.3 }}
            className="mt-6 max-w-sm mx-auto"
          >
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${budgetProgress}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className={`h-full rounded-full ${budgetProgress >= 100 ? 'bg-danger' : budgetProgress >= 80 ? 'bg-warning' : 'bg-accent'}`}
              />
            </div>
            <p className="text-text-muted text-sm mt-2">
              {Math.round(budgetProgress)}% of {formatCurrency(settings.monthlyBudget)} budget
            </p>
          </motion.div>
        )}
      </motion.section>

      {/* Category Pills */}
      {activeCategories.length > 0 && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-6 mb-8"
        >
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {activeCategories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <CategoryPill
                  emoji={cat.emoji}
                  name={cat.name}
                  amount={formatCurrency(categoryTotals[cat.id])}
                  color={cat.color}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Recent Expenses */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary font-heading">Recent</h2>
          {recentExpenses.length > 0 && (
            <Link to="/history" className="text-accent text-sm font-medium hover:text-accent-hover transition-colors">
              See all
            </Link>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-text-secondary mb-2">No expenses yet!</p>
            <p className="text-text-muted text-sm">Tap the + button to track your first purchase.</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {recentExpenses.map((expense, index) => {
                const category = categories.find(c => c.id === expense.categoryId);
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <ExpenseItem
                      expense={expense}
                      category={category}
                      formatCurrency={formatCurrency}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/add')}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 hover:bg-accent-hover transition-colors"
      >
        <Plus className="w-8 h-8 text-white" />
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />
      </motion.button>
    </div>
  );
}
