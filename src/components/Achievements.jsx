import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { RobotBuddy, getRandomMessage } from './RobotBuddy';

/**
 * Achievement System
 * 
 * Fun badges and milestones that make tracking expenses feel like a game.
 * The robot celebrates with you!
 */

// Achievement definitions
export const ACHIEVEMENTS = {
  // Getting started
  first_expense: {
    id: 'first_expense',
    emoji: '🎉',
    title: 'First Steps',
    description: 'Logged your first expense',
    secret: false,
    check: (stats) => stats.totalExpenses >= 1,
  },
  getting_started: {
    id: 'getting_started',
    emoji: '🌱',
    title: 'Getting Started',
    description: 'Logged 10 expenses',
    secret: false,
    check: (stats) => stats.totalExpenses >= 10,
  },
  century: {
    id: 'century',
    emoji: '💯',
    title: 'Century Club',
    description: 'Logged 100 expenses',
    secret: false,
    check: (stats) => stats.totalExpenses >= 100,
  },
  
  // Streaks
  streak_3: {
    id: 'streak_3',
    emoji: '🔥',
    title: 'On Fire',
    description: '3-day tracking streak',
    secret: false,
    check: (stats) => stats.currentStreak >= 3,
  },
  streak_7: {
    id: 'streak_7',
    emoji: '⚡',
    title: 'Week Warrior',
    description: '7-day tracking streak',
    secret: false,
    check: (stats) => stats.currentStreak >= 7,
  },
  streak_30: {
    id: 'streak_30',
    emoji: '🏆',
    title: 'Monthly Master',
    description: '30-day tracking streak',
    secret: false,
    check: (stats) => stats.currentStreak >= 30,
  },
  
  // Budget achievements
  under_budget: {
    id: 'under_budget',
    emoji: '💰',
    title: 'Budget Boss',
    description: 'Finished a month under budget',
    secret: false,
    check: (stats) => stats.monthsUnderBudget >= 1,
  },
  way_under: {
    id: 'way_under',
    emoji: '🤑',
    title: 'Super Saver',
    description: 'Finished a month 20% under budget',
    secret: false,
    check: (stats) => stats.monthsWayUnderBudget >= 1,
  },
  
  // Category achievements
  diversified: {
    id: 'diversified',
    emoji: '🎨',
    title: 'Diversified',
    description: 'Used 5 different categories',
    secret: false,
    check: (stats) => stats.uniqueCategories >= 5,
  },
  
  // Fun/secret achievements
  early_bird: {
    id: 'early_bird',
    emoji: '🌅',
    title: 'Early Bird',
    description: 'Logged an expense before 6 AM',
    secret: true,
    check: (stats) => stats.hasEarlyExpense,
  },
  night_owl: {
    id: 'night_owl',
    emoji: '🦉',
    title: 'Night Owl',
    description: 'Logged an expense after midnight',
    secret: true,
    check: (stats) => stats.hasLateExpense,
  },
  big_spender: {
    id: 'big_spender',
    emoji: '💸',
    title: 'Big Spender',
    description: 'Single expense over $500',
    secret: true,
    check: (stats) => stats.largestExpense >= 50000, // cents
  },
  penny_pincher: {
    id: 'penny_pincher',
    emoji: '🪙',
    title: 'Penny Pincher',
    description: 'Logged an expense under $1',
    secret: true,
    check: (stats) => stats.smallestExpense > 0 && stats.smallestExpense < 100,
  },
  robot_friend: {
    id: 'robot_friend',
    emoji: '🤖',
    title: 'Robot Friend',
    description: 'Tapped the robot 25 times',
    secret: true,
    check: (stats) => stats.robotTaps >= 25,
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    emoji: '🎮',
    title: 'Weekend Warrior',
    description: 'Track expenses on Saturday AND Sunday',
    secret: false,
    check: (stats) => stats.hasWeekendTracking,
  },
};

// Calculate achievement stats from expenses
export function calculateAchievementStats(expenses, settings = {}) {
  const stats = {
    totalExpenses: expenses.length,
    currentStreak: settings?.streakData?.currentStreak || 0,
    longestStreak: settings?.streakData?.longestStreak || 0,
    monthsUnderBudget: settings?.monthsUnderBudget || 0,
    monthsWayUnderBudget: settings?.monthsWayUnderBudget || 0,
    uniqueCategories: new Set(expenses.map(e => e.category_id)).size,
    hasEarlyExpense: false,
    hasLateExpense: false,
    largestExpense: 0,
    smallestExpense: Infinity,
    robotTaps: settings?.robotTaps || 0,
    hasWeekendTracking: false,
  };

  // Check each expense
  let hasSaturday = false;
  let hasSunday = false;
  
  expenses.forEach(expense => {
    // Time-based checks
    const date = new Date(expense.date || expense.created_at);
    const hour = date.getHours();
    const day = date.getDay();
    
    if (hour < 6) stats.hasEarlyExpense = true;
    if (hour >= 0 && hour < 5) stats.hasLateExpense = true;
    if (day === 6) hasSaturday = true;
    if (day === 0) hasSunday = true;
    
    // Amount checks
    if (expense.amount > stats.largestExpense) {
      stats.largestExpense = expense.amount;
    }
    if (expense.amount < stats.smallestExpense) {
      stats.smallestExpense = expense.amount;
    }
  });

  stats.hasWeekendTracking = hasSaturday && hasSunday;
  
  if (stats.smallestExpense === Infinity) {
    stats.smallestExpense = 0;
  }

  return stats;
}

// Check which achievements are unlocked
export function getUnlockedAchievements(expenses, settings) {
  const stats = calculateAchievementStats(expenses, settings);
  const unlocked = [];
  
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (achievement.check(stats)) {
      unlocked.push(achievement);
    }
  });
  
  return unlocked;
}

// Check for newly unlocked achievements
export function checkNewAchievements(expenses, settings, previouslyUnlocked = []) {
  const currentUnlocked = getUnlockedAchievements(expenses, settings);
  const previousIds = new Set(previouslyUnlocked.map(a => a.id));
  
  return currentUnlocked.filter(a => !previousIds.has(a.id));
}

// Achievement badge component
export function AchievementBadge({ achievement, locked = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${sizeClasses[size]} rounded-2xl flex items-center justify-center
        ${locked 
          ? 'bg-surface-raised text-text-muted' 
          : 'bg-gradient-to-br from-accent/20 to-purple-500/20 border border-accent/30'}
      `}
    >
      {locked ? '🔒' : achievement.emoji}
    </motion.div>
  );
}

// Achievement unlock toast
export function AchievementToast({ achievement, onClose }) {
  const [robotMessage] = useState(() => getRandomMessage('milestone'));

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed bottom-24 left-4 right-4 z-50"
    >
      <div className="bg-surface-raised border border-accent/30 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <RobotBuddy mood="celebrating" size="sm" showMessage={false} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{achievement.emoji}</span>
              <span className="font-bold text-text-primary">{achievement.title}</span>
              {achievement.secret && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                  SECRET
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">{achievement.description}</p>
            <p className="text-xs text-text-muted mt-1 italic">{robotMessage}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Full achievements page/modal
export function AchievementsPage({ expenses, settings, onClose }) {
  const unlocked = getUnlockedAchievements(expenses, settings);
  const unlockedIds = new Set(unlocked.map(a => a.id));
  
  const allAchievements = Object.values(ACHIEVEMENTS);
  const visibleAchievements = allAchievements.filter(a => !a.secret || unlockedIds.has(a.id));
  const secretCount = allAchievements.filter(a => a.secret && !unlockedIds.has(a.id)).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-text-secondary">
            ← Back
          </button>
          <h1 className="font-heading font-bold text-text-primary">Achievements</h1>
          <div className="w-12" />
        </div>
      </div>

      {/* Robot celebration */}
      <div className="text-center py-8">
        <RobotBuddy 
          mood={unlocked.length >= 5 ? 'proud' : 'happy'}
          size="lg"
          message={`${unlocked.length} of ${visibleAchievements.length} unlocked!`}
          showMessage={true}
        />
      </div>

      {/* Achievement grid */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {visibleAchievements.map(achievement => {
            const isLocked = !unlockedIds.has(achievement.id);
            return (
              <div 
                key={achievement.id}
                className={`p-4 rounded-xl ${isLocked ? 'bg-surface' : 'bg-surface-raised'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <AchievementBadge achievement={achievement} locked={isLocked} size="sm" />
                  <div>
                    <h3 className={`font-semibold ${isLocked ? 'text-text-muted' : 'text-text-primary'}`}>
                      {achievement.title}
                    </h3>
                    {achievement.secret && !isLocked && (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                        SECRET
                      </span>
                    )}
                  </div>
                </div>
                <p className={`text-sm ${isLocked ? 'text-text-muted' : 'text-text-secondary'}`}>
                  {isLocked && achievement.secret ? '???' : achievement.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Secret achievements teaser */}
        {secretCount > 0 && (
          <div className="mt-6 text-center">
            <p className="text-text-muted text-sm">
              🔮 {secretCount} secret achievement{secretCount !== 1 ? 's' : ''} remaining...
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
