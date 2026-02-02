import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/format';
import { getLocalDateString, getLocalMonthString } from '../utils/dateUtils';
import haptic from '../utils/haptics';
import playSound from '../utils/sounds';

/**
 * Money Saved Tracker
 * Celebrates NOT spending by tracking:
 * 1. Days without spending in certain categories
 * 2. Budget remaining vs typical spending
 * 3. Avoided purchases (user-logged)
 */

// Savings goals suggestions
const SAVINGS_SUGGESTIONS = [
  { id: 'coffee', emoji: '☕', name: 'Skip the café', avgSaving: 500 }, // $5
  { id: 'lunch', emoji: '🍱', name: 'Pack lunch', avgSaving: 1200 }, // $12
  { id: 'uber', emoji: '🚗', name: 'Walk/bike instead', avgSaving: 1500 }, // $15
  { id: 'subscription', emoji: '📺', name: 'Cancel unused sub', avgSaving: 1500 },
  { id: 'drinks', emoji: '🍺', name: 'Skip happy hour', avgSaving: 3000 }, // $30
  { id: 'impulse', emoji: '🛒', name: 'Resist impulse buy', avgSaving: 2500 },
];

// Calculate streak savings
function calculateStreakSavings(expenses, categoryId, avgDailySpend) {
  if (!expenses || expenses.length === 0) return { days: 0, saved: 0 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streakDays = 0;
  let checkDate = new Date(today);
  
  // Count backwards from today
  while (true) {
    const dateStr = getLocalDateString(checkDate);
    const dayExpenses = expenses.filter(e => 
      e.date?.startsWith(dateStr) && 
      (!categoryId || e.category_id === categoryId)
    );
    
    if (dayExpenses.length > 0) break;
    
    streakDays++;
    checkDate.setDate(checkDate.getDate() - 1);
    
    // Don't count more than 30 days back
    if (streakDays > 30) break;
  }
  
  return {
    days: streakDays,
    saved: streakDays * avgDailySpend,
  };
}

// Avoided purchase logger
export function AvoidedPurchaseLogger({ onLog, onClose }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const handleLog = () => {
    if (!amount) return;
    
    haptic('success');
    playSound('achievement');
    
    onLog({
      amount: parseInt(amount) * 100,
      description: description || 'Resisted temptation',
      date: new Date().toISOString(),
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        className="bg-surface w-full max-w-sm rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-text-primary mb-2">
          💪 I Didn't Buy...
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Log something you resisted buying. Celebrate your willpower!
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-muted mb-1 block">
              What would it have cost?
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 bg-surface-raised rounded-xl 
                         text-text-primary text-lg font-semibold
                         focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm text-text-muted mb-1 block">
              What was it? (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., New shoes, fancy coffee..."
              className="w-full px-4 py-3 bg-surface-raised rounded-xl 
                       text-text-primary
                       focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2">
            {SAVINGS_SUGGESTIONS.slice(0, 4).map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setAmount(String(s.avgSaving / 100));
                  setDescription(s.name);
                }}
                className="px-3 py-1.5 bg-surface-raised rounded-full text-sm
                         text-text-secondary hover:text-text-primary transition-colors"
              >
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-surface-raised rounded-xl text-text-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleLog}
            disabled={!amount}
            className="flex-1 py-3 bg-green-500 rounded-xl text-white font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Log Savings
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Money saved dashboard widget
export function MoneySavedWidget({ 
  monthlyBudget, 
  monthTotal, 
  expenses, 
  avoidedPurchases = [],
  onLogAvoided 
}) {
  const [showLogger, setShowLogger] = useState(false);
  
  // Calculate different savings metrics
  const budgetRemaining = monthlyBudget ? Math.max(0, monthlyBudget - monthTotal) : 0;
  
  // Calculate coffee streak savings (assuming $5/day average)
  const coffeeStreak = calculateStreakSavings(
    expenses?.filter(e => e.category_id === 'coffee'),
    'coffee',
    500
  );
  
  // Calculate dining out streak
  const diningStreak = calculateStreakSavings(
    expenses?.filter(e => e.category_id === 'dining'),
    'dining',
    2000
  );
  
  // Total avoided purchases this month
  const currentMonth = getLocalMonthString();
  const monthAvoidedTotal = avoidedPurchases
    .filter(p => p.date?.startsWith(currentMonth))
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Total "saved" (budget remaining + avoided purchases)
  const totalSaved = budgetRemaining + monthAvoidedTotal;
  
  if (!monthlyBudget && avoidedPurchases.length === 0) {
    return null;
  }
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 
                   border border-green-500/30 rounded-2xl p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <span>💰</span> Money Saved
          </h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogger(true)}
            className="text-sm text-green-400 font-medium"
          >
            + Log
          </motion.button>
        </div>
        
        {/* Big number */}
        <div className="text-center py-2">
          <motion.div
            key={totalSaved}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-green-400"
          >
            {formatCurrency(totalSaved)}
          </motion.div>
          <p className="text-sm text-text-muted mt-1">
            kept in your pocket this month
          </p>
        </div>
        
        {/* Breakdown */}
        <div className="mt-4 space-y-2">
          {budgetRemaining > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">📊 Under budget</span>
              <span className="text-green-400">{formatCurrency(budgetRemaining)}</span>
            </div>
          )}
          
          {monthAvoidedTotal > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">💪 Resisted purchases</span>
              <span className="text-green-400">{formatCurrency(monthAvoidedTotal)}</span>
            </div>
          )}
          
          {coffeeStreak.days > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                ☕ {coffeeStreak.days} day coffee streak
              </span>
              <span className="text-green-400">~{formatCurrency(coffeeStreak.saved)}</span>
            </div>
          )}
        </div>
        
        {/* Motivational message */}
        {totalSaved >= 10000 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-green-500/20 rounded-xl text-center"
          >
            <p className="text-sm text-green-300">
              🎉 That's {Math.floor(totalSaved / 500)} coffees worth of savings!
            </p>
          </motion.div>
        )}
      </motion.div>
      
      <AnimatePresence>
        {showLogger && (
          <AvoidedPurchaseLogger
            onLog={(purchase) => {
              onLogAvoided(purchase);
              setShowLogger(false);
            }}
            onClose={() => setShowLogger(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export { calculateStreakSavings, SAVINGS_SUGGESTIONS };
