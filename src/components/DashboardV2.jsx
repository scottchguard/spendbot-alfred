import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GlassCard, 
  BentoGrid, 
  AnimatedBackground,
  NoiseTexture,
  MiniProgressBar,
  SparklineChart,
} from './ui';
import { formatCurrency, getCurrentMonthName } from '../utils/format';
import { RobotBuddy, useRobotBuddy, getRandomMessage } from './RobotBuddy';
import { AchievementsPage } from './Achievements';
import { DailyChallenge } from './DailyChallenge';
import { WeeklyReportTrigger } from './WeeklyReport';
import { NoSpendDayBadge } from './NoSpendCelebration';
import { FinancialFortuneCard } from './FinancialFortune';
import { SpendingPersonalityCard } from './SpendingPersonality';
import { BudgetHealthMeter } from './BudgetHealth';
import { useKonamiCode, useShakeDetection, KonamiEasterEgg, ShakeEasterEgg, SecretTapZone } from './EasterEggs';
import { playSound } from '../utils/sounds';
import { haptic } from '../utils/haptics';

/**
 * DashboardV2 - A completely redesigned, polished dashboard
 * 
 * Features:
 * - Glassmorphism cards with subtle animations
 * - Animated gradient background
 * - Bento grid layout for stats
 * - Progress rings for budget visualization
 * - Sparkline charts for trends
 * - Enhanced micro-interactions
 */

// Animated currency display with counting effect
function AnimatedCurrency({ value, className = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 40;
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

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {formatCurrency(displayValue)}
    </motion.span>
  );
}

// Quick stat card for the bento grid
function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  trendLabel,
  variant = 'default',
  sparklineData,
  onClick,
}) {
  const trendColor = trend > 0 ? 'text-danger' : trend < 0 ? 'text-success' : 'text-text-muted';
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '';

  return (
    <GlassCard 
      variant={variant} 
      hover={!!onClick}
      onClick={onClick}
      className="h-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <span className="text-2xl">{icon}</span>
          {sparklineData && (
            <SparklineChart 
              data={sparklineData} 
              width={60} 
              height={24}
              color={variant === 'success' ? '#10B981' : '#6366F1'}
            />
          )}
        </div>
        
        <div className="mt-auto">
          <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-text-primary text-xl font-semibold">
            {value}
          </p>
          {(trend !== undefined || trendLabel) && (
            <p className={`text-xs mt-1 ${trendColor}`}>
              {trendIcon} {trendLabel || `${Math.abs(trend)}%`}
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// Category pill with spending amount
function CategoryPill({ category, total, percentage, maxTotal }) {
  const widthPercent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      <div className="flex items-center gap-3 py-2">
        <span className="text-xl w-8">{category.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-text-primary truncate">
              {category.name}
            </span>
            <span className="text-sm font-medium text-text-primary ml-2">
              {formatCurrency(total)}
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: category.color || '#6366F1' }}
              initial={{ width: 0 }}
              animate={{ width: `${widthPercent}%` }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          </div>
        </div>
        <span className="text-xs text-text-muted w-10 text-right">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </motion.div>
  );
}

// Recent expense item
function ExpenseItem({ expense, category }) {
  const dateStr = expense.date || expense.created_at;
  const time = dateStr ? new Date(dateStr) : null;
  const today = useMemo(() => new Date(), []);
  const isToday = time && time.toDateString() === today.toDateString();
  const timeStr = !time 
    ? 'Just now'
    : isToday 
      ? time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : time.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-2"
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        <span className="text-lg">{category?.emoji || '📦'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate">
          {category?.name || 'Other'}
        </p>
        <p className="text-xs text-text-muted">{timeStr}</p>
      </div>
      <p className="text-sm font-medium text-text-primary">
        -{formatCurrency(expense.amount)}
      </p>
    </motion.div>
  );
}

// Main Dashboard Component
export function DashboardV2({ 
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
  onCalendarClick,
}) {
  const [showRobotMessage, setShowRobotMessage] = useState(false);
  const [robotMessage, setRobotMessage] = useState(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showKonamiEgg, setShowKonamiEgg] = useState(false);
  const [showShakeEgg, setShowShakeEgg] = useState(false);

  // Robot buddy hook
  const { mood } = useRobotBuddy({
    expenses,
    settings,
    monthTotal,
  });

  // Easter egg hooks
  useKonamiCode(() => {
    playSound('achievement');
    haptic('achievement');
    setShowKonamiEgg(true);
  });

  useShakeDetection(() => {
    playSound('success');
    haptic('success');
    setShowShakeEgg(true);
  });

  // Calculate stats
  const budgetPercentage = settings?.monthlyBudget 
    ? (monthTotal / settings.monthlyBudget) * 100
    : null;

  const todayExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return (expenses || []).filter(e => e.date?.startsWith(todayStr));
  }, [expenses]);

  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgPerExpense = monthCount > 0 ? monthTotal / monthCount : 0;

  // Calculate daily spending for the last 7 days
  const dailySpending = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayTotal = expenses
        .filter(e => e.date?.startsWith(dateStr))
        .reduce((sum, e) => sum + e.amount, 0);
      days.push(dayTotal);
    }
    return days;
  }, [expenses]);

  // Category breakdown with percentages
  const categoryBreakdown = useMemo(() => {
    if (!categoryTotals?.length) return [];
    const maxTotal = Math.max(...categoryTotals.map(c => c.total));
    return categoryTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(cat => ({
        ...cat,
        percentage: monthTotal > 0 ? (cat.total / monthTotal) * 100 : 0,
        maxTotal,
      }));
  }, [categoryTotals, monthTotal]);

  // Days left calculation
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();
  
  // Robot greeting on mount - intentionally only runs once
  useEffect(() => {
    const timer = setTimeout(() => {
      let messageType = 'greeting';
      const hour = new Date().getHours();
      
      if (hour >= 23 || hour < 5) messageType = 'lateNight';
      else if (monthCount === 0) messageType = 'empty';
      else if (streakInfo?.current >= 3) messageType = 'streak';
      
      const msg = getRandomMessage(messageType, { n: streakInfo?.current });
      setRobotMessage(msg);
      setShowRobotMessage(true);
      setTimeout(() => setShowRobotMessage(false), 4000);
    }, 800);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentExpenses = expenses.slice(0, 4);

  return (
    <AnimatedBackground variant="mesh" intensity="low" className="min-h-screen">
      <NoiseTexture opacity={0.02} />
      
      <div className="pb-28 px-4 pt-12">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              {getCurrentMonthName()}
            </h1>
            <p className="text-sm text-text-muted">
              {daysLeft} days remaining
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onCalendarClick}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
              aria-label="Open calendar view"
            >
              <span className="text-xl" aria-hidden="true">📅</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAchievements(true)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
              aria-label="View achievements"
            >
              <span className="text-xl" aria-hidden="true">🏆</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onSettingsClick}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
              aria-label="Open settings"
            >
              <span className="text-xl" aria-hidden="true">⚙️</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Robot Buddy */}
        <motion.div 
          className="flex justify-center mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
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
        </motion.div>

        {/* Main Total Card */}
        <GlassCard variant="gradient" glow glowColor="accent" className="mb-4" padding="lg">
          <div className="text-center">
            <AnimatedCurrency
              value={monthTotal}
              className="font-display text-5xl font-bold text-text-primary"
            />
            <p className="text-text-secondary mt-2">Total This Month</p>
            
            {/* Streak Badge */}
            {streakInfo?.current > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 
                           bg-gradient-to-r from-orange-500/20 to-red-500/20 
                           rounded-full border border-orange-500/30"
              >
                <span className="text-lg">🔥</span>
                <span className="text-sm font-semibold text-orange-400">
                  {streakInfo.current} day streak
                </span>
              </motion.div>
            )}
          </div>
        </GlassCard>

        {/* Budget Health Meter - Dramatic Replacement! */}
        {budgetPercentage !== null && (
          <BudgetHealthMeter
            spent={monthTotal}
            budget={settings.monthlyBudget}
            daysLeft={daysLeft}
          />
        )}

        {/* Weekly Report (Sundays) */}
        <WeeklyReportTrigger 
          expenses={expenses} 
          monthlyBudget={settings?.monthlyBudget} 
        />

        {/* No Spend Day Celebration */}
        <NoSpendDayBadge 
          expenses={expenses}
          onCelebrate={() => {
            playSound('achievement');
            haptic('achievement');
          }}
        />

        {/* Daily Challenge */}
        <DailyChallenge 
          expenses={expenses}
          onComplete={() => {
            playSound('success');
            haptic('success');
          }}
        />

        {/* Financial Fortune - Daily "Horoscope" for Your Wallet */}
        <FinancialFortuneCard 
          expenses={expenses}
          budget={settings?.monthlyBudget}
        />

        {/* Spending Personality Discovery */}
        <SpendingPersonalityCard 
          expenses={expenses}
          categoryTotals={categoryTotals}
        />

        {/* Bento Grid Stats */}
        <BentoGrid className="mb-4">
          <StatCard
            label="Today"
            value={formatCurrency(todayTotal)}
            icon="📅"
            variant={todayTotal > 0 ? 'default' : 'default'}
          />
          <StatCard
            label="Transactions"
            value={monthCount}
            icon="📊"
            sparklineData={dailySpending}
          />
          <StatCard
            label="Average"
            value={formatCurrency(avgPerExpense)}
            icon="📈"
          />
          <StatCard
            label="This Week"
            value={formatCurrency(dailySpending.reduce((a, b) => a + b, 0))}
            icon="📆"
          />
        </BentoGrid>

        {/* Free tier indicator */}
        {!settings?.isPremium && (
          <div className="text-center text-sm text-text-muted mb-4">
            {monthCount}/50 expenses this month
            <MiniProgressBar 
              progress={(monthCount / 50) * 100} 
              color="accent"
              className="mt-2 max-w-[200px] mx-auto"
            />
          </div>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <GlassCard className="mb-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Top Categories
            </h3>
            <div className="space-y-1">
              {categoryBreakdown.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  category={cat}
                  total={cat.total}
                  percentage={cat.percentage}
                  maxTotal={cat.maxTotal}
                />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Recent Transactions */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Recent
            </h3>
            {expenses.length > 0 && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={onHistoryClick}
                className="text-sm text-accent"
              >
                See All →
              </motion.button>
            )}
          </div>
          
          {recentExpenses.length > 0 ? (
            <div className="divide-y divide-white/5">
              {recentExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  category={categories.find(c => c.id === expense.category_id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-muted">No expenses yet</p>
              <p className="text-sm text-text-muted mt-1">
                Tap + to add your first one!
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* FAB - Centered with safe area support */}
      <div className="fixed bottom-0 left-0 right-0 pb-8 flex justify-center pointer-events-none"
           style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
        <motion.button
          onClick={onAddClick}
          className="w-16 h-16 pointer-events-auto
                     bg-gradient-to-br from-accent to-purple-600 rounded-full 
                     flex items-center justify-center text-3xl text-white
                     shadow-[0_0_30px_rgba(99,102,241,0.5)]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          aria-label="Add new expense"
        >
          <span aria-hidden="true">+</span>
        </motion.button>
      </div>

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

      {/* Easter Eggs */}
      <KonamiEasterEgg 
        show={showKonamiEgg} 
        onClose={() => setShowKonamiEgg(false)} 
      />
      <ShakeEasterEgg 
        show={showShakeEgg} 
        onClose={() => setShowShakeEgg(false)}
        expenses={expenses}
      />

      {/* Secret Tap Zone on Robot for extra fun */}
      <SecretTapZone 
        requiredTaps={7}
        onActivate={() => {
          playSound('achievement');
          setRobotMessage("🤫 You found a secret! You're persistent... I like that.");
          setShowRobotMessage(true);
          setTimeout(() => setShowRobotMessage(false), 4000);
        }}
      />
    </AnimatedBackground>
  );
}

export default DashboardV2;
