import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatTime, getCurrentMonthName } from '../utils/format';
import { SmartInsights } from './SmartInsights';
import { WeeklyChart, CategoryBreakdown, SpendingPace } from './SpendingChart';
import { WelcomeCard } from './WelcomeCard';
import { RobotBuddy, useRobotBuddy, getRandomMessage } from './RobotBuddy';
import { SpendingPredictions, WeeklyComparison } from './SpendingPredictions';
import { AchievementsPage } from './Achievements';

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

function StreakBadge({ streak, trackedToday }) {
  if (streak === 0) return null;
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 
                 px-3 py-1.5 rounded-full border border-orange-500/30"
    >
      <span className="text-lg">🔥</span>
      <span className="text-sm font-semibold text-orange-400">
        {streak} day{streak !== 1 ? 's' : ''}
      </span>
      {!trackedToday && (
        <span className="text-xs text-orange-400/70 ml-1">
          Track today!
        </span>
      )}
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
  streakInfo,
  onAddClick,
  onHistoryClick,
  onSettingsClick,
  userName
}) {
  const recentExpenses = expenses.slice(0, 5);
  const [showRobotMessage, setShowRobotMessage] = useState(false);
  const [robotMessage, setRobotMessage] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);
  
  // Robot buddy hook
  const { mood, getContextualMessage, getExpenseReaction } = useRobotBuddy({
    expenses,
    settings,
    monthTotal,
  });
  
  const budgetPercentage = settings?.monthlyBudget 
    ? Math.min((monthTotal / settings.monthlyBudget) * 100, 100)
    : null;

  // Show robot greeting on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      let messageType = 'greeting';
      
      // Contextual greetings
      const hour = new Date().getHours();
      if (hour >= 23 || hour < 5) {
        messageType = 'lateNight';
      } else if (monthCount === 0) {
        messageType = 'empty';
      } else if (streakInfo?.current >= 3) {
        messageType = 'streak';
      }
      
      const msg = getRandomMessage(messageType, { n: streakInfo?.current });
      setRobotMessage(msg);
      setShowRobotMessage(true);
      
      // Hide after 4 seconds
      setTimeout(() => setShowRobotMessage(false), 4000);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Calculate date info for insights
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();

  // Check if today has expenses
  const todayStr = now.toISOString().slice(0, 10);
  const todayExpenses = expenses.filter(e => e.date?.startsWith(todayStr));
  const trackedToday = todayExpenses.length > 0;

  // Show welcome card for new users (< 10 expenses)
  const showWelcome = monthCount < 10;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-heading font-semibold text-text-primary">
            {getCurrentMonthName()}
          </h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAchievements(true)} 
              className="text-text-secondary text-2xl hover:opacity-80 transition-opacity"
            >
              🏆
            </button>
            <button 
              onClick={onSettingsClick} 
              className="text-text-secondary text-2xl hover:opacity-80 transition-opacity"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Robot Buddy */}
        <div className="flex justify-center mb-4">
          <RobotBuddy 
            mood={mood}
            size="lg"
            message={showRobotMessage ? robotMessage : null}
            showMessage={showRobotMessage}
            onTap={() => {
              const msg = getRandomMessage('greeting');
              setRobotMessage(msg);
              setShowRobotMessage(true);
              setTimeout(() => setShowRobotMessage(false), 3000);
            }}
          />
        </div>

        {/* Monthly Total */}
        <div className="text-center mb-6">
          <AnimatedNumber
            value={monthTotal}
            className="font-display text-5xl md:text-6xl font-bold text-text-primary"
          />
          <p className="text-text-secondary mt-2">This Month</p>
          
          {/* Streak Badge */}
          <div className="mt-4 flex justify-center">
            <StreakBadge 
              streak={streakInfo?.current || 0} 
              trackedToday={trackedToday} 
            />
          </div>
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

        {/* Spending Pace (when budget is set) */}
        {settings?.monthlyBudget && monthCount >= 5 && (
          <SpendingPace
            monthTotal={monthTotal}
            monthlyBudget={settings.monthlyBudget}
            daysInMonth={daysInMonth}
            currentDay={currentDay}
          />
        )}

        {/* Spending Predictions - The Crystal Ball 🔮 */}
        {monthCount >= 5 && (
          <SpendingPredictions
            expenses={expenses}
            monthlyBudget={settings?.monthlyBudget}
          />
        )}

        {/* Weekly Comparison */}
        {monthCount >= 10 && (
          <WeeklyComparison expenses={expenses} />
        )}

        {/* Free tier counter */}
        {!settings?.isPremium && (
          <div className="text-center text-sm text-text-muted mb-4">
            {monthCount}/50 expenses this month
          </div>
        )}

        {/* Welcome Card for new users */}
        {showWelcome && (
          <WelcomeCard
            userName={userName}
            expenseCount={monthCount}
            onAddClick={onAddClick}
          />
        )}
        
        {/* Smart Insights */}
        {!showWelcome && (
          <SmartInsights
            expenses={expenses}
            monthlyBudget={settings?.monthlyBudget}
            isPremium={settings?.isPremium}
          />
        )}
      </div>

      {/* Weekly Chart (show when enough data) */}
      {monthCount >= 3 && (
        <div className="px-6">
          <WeeklyChart expenses={expenses} />
        </div>
      )}

      {/* Category Breakdown */}
      {categoryTotals && categoryTotals.length > 0 && (
        <div className="px-6">
          <CategoryBreakdown 
            categoryTotals={categoryTotals}
            monthTotal={monthTotal}
          />
        </div>
      )}

      {/* Recent Transactions */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Recent
          </h2>
          {expenses.length > 0 && (
            <button 
              onClick={onHistoryClick}
              className="text-sm text-accent hover:opacity-80 transition-opacity"
            >
              See All →
            </button>
          )}
        </div>
        
        {recentExpenses.length === 0 && !showWelcome ? (
          <div className="text-center py-12">
            <RobotBuddy 
              mood="thinking"
              size="lg"
              message={getRandomMessage('empty')}
              showMessage={true}
            />
            <p className="text-text-muted text-sm mt-4">
              Tap the + button to track your first purchase.
            </p>
          </div>
        ) : recentExpenses.length > 0 ? (
          <div className="space-y-2">
            {recentExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                category={categories.find(c => c.id === expense.category_id)}
              />
            ))}
          </div>
        ) : null}
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

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <AchievementsPage
            expenses={expenses}
            settings={{ ...settings, streakData: streakInfo }}
            onClose={() => setShowAchievements(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
