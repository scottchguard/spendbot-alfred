import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { RobotBuddy, getRandomMessage } from './RobotBuddy';

/**
 * Achievement System - NOW WITH 100% MORE PERSONALITY
 * 
 * These aren't your grandma's achievements. These are BADGES OF HONOR.
 * (And sometimes shame. But fun shame.)
 */

// Achievement definitions - now with personality
export const ACHIEVEMENTS = {
  // Getting started
  first_expense: {
    id: 'first_expense',
    emoji: '🐣',
    title: 'Baby\'s First Expense',
    description: 'You logged something! The journey begins.',
    unlockMessage: 'And so it begins... welcome to adulthood.',
    secret: false,
    check: (stats) => stats.totalExpenses >= 1,
  },
  getting_started: {
    id: 'getting_started',
    emoji: '🌱',
    title: 'Getting Suspicious',
    description: '10 expenses tracked. Are you... actually doing this?',
    unlockMessage: 'Wait, you\'re still here? I\'m impressed.',
    secret: false,
    check: (stats) => stats.totalExpenses >= 10,
  },
  fifty_club: {
    id: 'fifty_club',
    emoji: '🎪',
    title: 'The 50 Club',
    description: 'Logged 50 expenses. This is getting real.',
    unlockMessage: 'Fifty expenses! That\'s like... a lot of receipts.',
    secret: false,
    check: (stats) => stats.totalExpenses >= 50,
  },
  century: {
    id: 'century',
    emoji: '💯',
    title: 'Triple Digit Demon',
    description: '100 expenses. You\'re basically a finance app now.',
    unlockMessage: 'ONE HUNDRED! You\'re not a user anymore, you\'re family.',
    secret: false,
    check: (stats) => stats.totalExpenses >= 100,
  },
  expense_500: {
    id: 'expense_500',
    emoji: '🏛️',
    title: 'The Expense Historian',
    description: '500 expenses documented for posterity.',
    unlockMessage: 'Your expense history could be a Netflix documentary.',
    secret: false,
    check: (stats) => stats.totalExpenses >= 500,
  },
  
  // Streaks
  streak_3: {
    id: 'streak_3',
    emoji: '🔥',
    title: 'Is That a Streak?',
    description: '3 days in a row. Baby flames!',
    unlockMessage: 'A streak! It\'s small, but it\'s YOURS.',
    secret: false,
    check: (stats) => stats.currentStreak >= 3,
  },
  streak_7: {
    id: 'streak_7',
    emoji: '⚡',
    title: 'Week Warrior',
    description: '7-day streak. You\'re officially committed.',
    unlockMessage: 'A WHOLE WEEK?! We\'re basically dating now.',
    secret: false,
    check: (stats) => stats.currentStreak >= 7,
  },
  streak_14: {
    id: 'streak_14',
    emoji: '🌙',
    title: 'Fortnight Freak',
    description: '14-day streak. Obsession looks good on you.',
    unlockMessage: 'Two weeks straight! You\'re giving "financially aware".',
    secret: false,
    check: (stats) => stats.currentStreak >= 14,
  },
  streak_30: {
    id: 'streak_30',
    emoji: '🏆',
    title: 'Monthly Maniac',
    description: '30-day streak. This is your personality now.',
    unlockMessage: 'A FULL MONTH! I\'m not crying, you\'re crying. 🥲',
    secret: false,
    check: (stats) => stats.currentStreak >= 30,
  },
  streak_69: {
    id: 'streak_69',
    emoji: '😏',
    title: 'Nice.',
    description: '69-day streak. Nice.',
    unlockMessage: 'Nice. Nice nice nice. Nice.',
    secret: true,
    check: (stats) => stats.currentStreak >= 69 || stats.longestStreak >= 69,
  },
  streak_100: {
    id: 'streak_100',
    emoji: '👑',
    title: 'The Streak Sovereign',
    description: '100-day streak. You are the chosen one.',
    unlockMessage: 'ONE HUNDRED DAYS! You\'re not human. You can\'t be.',
    secret: false,
    check: (stats) => stats.currentStreak >= 100,
  },
  streak_365: {
    id: 'streak_365',
    emoji: '🌍',
    title: 'Full Orbit',
    description: 'You tracked expenses for an entire year straight.',
    unlockMessage: 'You did it. Every. Single. Day. I bow to you. 🙇',
    secret: true,
    check: (stats) => stats.currentStreak >= 365,
  },
  
  // Budget achievements
  under_budget: {
    id: 'under_budget',
    emoji: '💰',
    title: 'Budget? Budg-YAY!',
    description: 'Finished a month under budget. Look at you!',
    unlockMessage: 'Under budget! Your future self just sent a thank you card.',
    secret: false,
    check: (stats) => stats.monthsUnderBudget >= 1,
  },
  way_under: {
    id: 'way_under',
    emoji: '🤑',
    title: 'Scrooge Mode Activated',
    description: '20% under budget. Are you okay? Do you need things?',
    unlockMessage: 'WAY under budget! Either you\'re saving or you forgot to eat.',
    secret: false,
    check: (stats) => stats.monthsWayUnderBudget >= 1,
  },
  budget_destroyer: {
    id: 'budget_destroyer',
    emoji: '💥',
    title: 'Budget Destroyer',
    description: 'Went 50% over budget. It happens to the best of us.',
    unlockMessage: 'The budget didn\'t stand a chance. F in the chat.',
    secret: true,
    check: (stats) => stats.monthsWayOverBudget >= 1,
  },
  
  // Category achievements
  diversified: {
    id: 'diversified',
    emoji: '🎨',
    title: 'Spending Portfolio',
    description: 'Used 5 different categories. Diversified spender!',
    unlockMessage: 'A balanced spending diet! Variety is the spice of broke.',
    secret: false,
    check: (stats) => stats.uniqueCategories >= 5,
  },
  
  // Caffeine achievements
  caffeine_addict: {
    id: 'caffeine_addict',
    emoji: '☕',
    title: 'Caffeine Aristocrat',
    description: 'Logged 20+ coffee expenses.',
    unlockMessage: 'At this point, your blood type is espresso.',
    secret: false,
    check: (stats) => stats.coffeeExpenses >= 20,
  },
  coffee_connoisseur: {
    id: 'coffee_connoisseur',
    emoji: '🫖',
    title: 'Professional Coffee Investor',
    description: 'Spent $100+ on coffee this month.',
    unlockMessage: '$100 in coffee. Your barista knows your deepest secrets.',
    secret: true,
    check: (stats) => stats.monthlyCoffeeSpend >= 10000,
  },
  
  // Food achievements
  food_blogger: {
    id: 'food_blogger',
    emoji: '🍕',
    title: 'Unofficial Food Blogger',
    description: '30+ food expenses logged.',
    unlockMessage: 'At this point, you should start an Instagram.',
    secret: false,
    check: (stats) => stats.foodExpenses >= 30,
  },
  
  // Time-based achievements
  early_bird: {
    id: 'early_bird',
    emoji: '🌅',
    title: 'Chaotic Early Bird',
    description: 'Logged an expense before 6 AM. Why are you awake?',
    unlockMessage: 'Before 6 AM?! Are you okay? Blink twice if you need help.',
    secret: true,
    check: (stats) => stats.hasEarlyExpense,
  },
  night_owl: {
    id: 'night_owl',
    emoji: '🦉',
    title: 'Midnight Accountant',
    description: 'Logged an expense after midnight. Spooky.',
    unlockMessage: 'After midnight purchases hit different. I see you. 👀',
    secret: true,
    check: (stats) => stats.hasLateExpense,
  },
  
  // Amount achievements
  big_spender: {
    id: 'big_spender',
    emoji: '💸',
    title: 'Casual Flexer',
    description: 'Single expense over $500. Big moves only.',
    unlockMessage: 'FIVE HUNDRED DOLLARS?! *faints in robot*',
    secret: true,
    check: (stats) => stats.largestExpense >= 50000,
  },
  whale: {
    id: 'whale',
    emoji: '🐋',
    title: 'Financial Whale',
    description: 'Single expense over $1000. You\'re built different.',
    unlockMessage: 'A THOUSAND DOLLARS?! My circuits are overheating.',
    secret: true,
    check: (stats) => stats.largestExpense >= 100000,
  },
  penny_pincher: {
    id: 'penny_pincher',
    emoji: '🪙',
    title: 'Penny Philosopher',
    description: 'Logged an expense under $1. Every cent matters!',
    unlockMessage: 'Under a dollar! This is the dedication I like to see.',
    secret: true,
    check: (stats) => stats.smallestExpense > 0 && stats.smallestExpense < 100,
  },
  exact_dollar: {
    id: 'exact_dollar',
    emoji: '🎯',
    title: 'The Perfectionist',
    description: 'Logged an expense that\'s exactly a round dollar amount.',
    unlockMessage: 'An exact dollar amount! The universe aligned for this.',
    secret: true,
    check: (stats) => stats.hasExactDollar,
  },
  
  // Robot achievements
  robot_friend: {
    id: 'robot_friend',
    emoji: '🤖',
    title: 'Robot Whisperer',
    description: 'Tapped the robot 25 times. We\'re friends now.',
    unlockMessage: 'You tapped me 25 times! This is either love or harassment.',
    secret: true,
    check: (stats) => stats.robotTaps >= 25,
  },
  robot_obsessed: {
    id: 'robot_obsessed',
    emoji: '💕',
    title: 'Robot\'s Best Friend',
    description: 'Tapped the robot 100 times. Get a hobby.',
    unlockMessage: 'A hundred taps?! I\'m concerned but also flattered.',
    secret: true,
    check: (stats) => stats.robotTaps >= 100,
  },
  
  // Weekend achievements
  weekend_warrior: {
    id: 'weekend_warrior',
    emoji: '🎮',
    title: 'Weekend Spender',
    description: 'Tracked on both Saturday AND Sunday. No rest!',
    unlockMessage: 'Weekend tracking! Your social life is... noted.',
    secret: false,
    check: (stats) => stats.hasWeekendTracking,
  },
  
  // No-spend achievements
  no_spend_day: {
    id: 'no_spend_day',
    emoji: '🧘',
    title: 'Zen Master',
    description: 'A full day with $0 spent. Inner peace achieved.',
    unlockMessage: 'You spent NOTHING today! Your wallet thanks you.',
    secret: false,
    check: (stats) => stats.noSpendDays >= 1,
  },
  no_spend_week: {
    id: 'no_spend_week',
    emoji: '🏔️',
    title: 'Ascended Being',
    description: '7 no-spend days in a month. Are you even human?',
    unlockMessage: 'SEVEN no-spend days?! You\'ve transcended consumerism.',
    secret: true,
    check: (stats) => stats.noSpendDays >= 7,
  },
  
  // Misc fun achievements
  same_amount_twice: {
    id: 'same_amount_twice',
    emoji: '👯',
    title: 'Deja Vu',
    description: 'Logged the same amount twice in a row.',
    unlockMessage: 'Same amount twice! Glitch in the matrix or consistency?',
    secret: true,
    check: (stats) => stats.hasSameAmountTwice,
  },
  lucky_7: {
    id: 'lucky_7',
    emoji: '🎰',
    title: 'Lucky Number',
    description: 'Logged an expense with 7.77 in it.',
    unlockMessage: 'Lucky 7s! Quick, buy a lottery ticket!',
    secret: true,
    check: (stats) => stats.hasLucky777,
  },
  friday_spender: {
    id: 'friday_spender',
    emoji: '🎉',
    title: 'TGIF Spender',
    description: 'Logged 5+ expenses on a Friday. Treat yourself!',
    unlockMessage: 'Friday spending spree! You earned it (probably).',
    secret: true,
    check: (stats) => stats.maxFridayExpenses >= 5,
  },
  
  // Existential achievements
  first_of_month: {
    id: 'first_of_month',
    emoji: '📅',
    title: 'Fresh Start',
    description: 'First expense on the 1st of a month.',
    unlockMessage: 'Starting the month strong! Or... immediately spending. Depends.',
    secret: true,
    check: (stats) => stats.hasFirstOfMonth,
  },
  last_of_month: {
    id: 'last_of_month',
    emoji: '🏁',
    title: 'Photo Finish',
    description: 'Expense on the last day of a month.',
    unlockMessage: 'Squeezing it in before month\'s end! Respect.',
    secret: true,
    check: (stats) => stats.hasLastOfMonth,
  },
};

// Fun unlock messages when new achievement is earned
const CELEBRATION_MESSAGES = [
  "🎉 ACHIEVEMENT UNLOCKED! Frame this moment.",
  "🏆 New badge acquired! You're basically a Pokémon trainer but for expenses.",
  "⭐ Achievement get! Your mom would be proud. Maybe.",
  "🎊 DING! Level up! ...wait, this isn't a game. Or is it?",
  "🌟 New achievement! Put it on your resume.",
  "🎯 Badge earned! This one sparks joy.",
  "✨ Achievement unlocked! Tell everyone. EVERYONE.",
  "🎪 New badge! Your trophy case grows stronger.",
];

// Calculate achievement stats from expenses
export function calculateAchievementStats(expenses, settings = {}) {
  const stats = {
    totalExpenses: expenses.length,
    currentStreak: settings?.streakData?.currentStreak || 0,
    longestStreak: settings?.streakData?.longestStreak || 0,
    monthsUnderBudget: settings?.monthsUnderBudget || 0,
    monthsWayUnderBudget: settings?.monthsWayUnderBudget || 0,
    monthsWayOverBudget: settings?.monthsWayOverBudget || 0,
    uniqueCategories: new Set(expenses.map(e => e.category_id)).size,
    hasEarlyExpense: false,
    hasLateExpense: false,
    largestExpense: 0,
    smallestExpense: Infinity,
    robotTaps: settings?.robotTaps || 0,
    hasWeekendTracking: false,
    coffeeExpenses: 0,
    foodExpenses: 0,
    monthlyCoffeeSpend: 0,
    noSpendDays: settings?.noSpendDays || 0,
    hasSameAmountTwice: false,
    hasLucky777: false,
    maxFridayExpenses: 0,
    hasFirstOfMonth: false,
    hasLastOfMonth: false,
    hasExactDollar: false,
  };

  // Track for duplicate detection
  let lastAmount = null;
  let fridayExpenses = {};
  let hasSaturday = false;
  let hasSunday = false;
  
  expenses.forEach((expense, index) => {
    const date = new Date(expense.date || expense.created_at);
    const hour = date.getHours();
    const day = date.getDay();
    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    // Time-based checks
    if (hour < 6) stats.hasEarlyExpense = true;
    if (hour >= 0 && hour < 5) stats.hasLateExpense = true;
    if (day === 6) hasSaturday = true;
    if (day === 0) hasSunday = true;
    
    // First/last of month
    if (dayOfMonth === 1) stats.hasFirstOfMonth = true;
    const lastDay = new Date(year, month + 1, 0).getDate();
    if (dayOfMonth === lastDay) stats.hasLastOfMonth = true;
    
    // Friday tracking
    if (day === 5) {
      const key = `${year}-${month}-${dayOfMonth}`;
      fridayExpenses[key] = (fridayExpenses[key] || 0) + 1;
    }
    
    // Amount checks
    if (expense.amount > stats.largestExpense) {
      stats.largestExpense = expense.amount;
    }
    if (expense.amount < stats.smallestExpense) {
      stats.smallestExpense = expense.amount;
    }
    
    // Exact dollar check
    if (expense.amount % 100 === 0) {
      stats.hasExactDollar = true;
    }
    
    // Same amount twice in a row
    if (lastAmount !== null && expense.amount === lastAmount) {
      stats.hasSameAmountTwice = true;
    }
    lastAmount = expense.amount;
    
    // Lucky 777
    if (expense.amount === 777 || expense.amount === 7777 || expense.amount === 77700) {
      stats.hasLucky777 = true;
    }
    
    // Category tracking (simple name matching)
    const categoryName = expense.category?.toLowerCase() || '';
    if (categoryName.includes('coffee') || categoryName.includes('cafe')) {
      stats.coffeeExpenses++;
      // Rough monthly coffee tracking (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (date > thirtyDaysAgo) {
        stats.monthlyCoffeeSpend += expense.amount;
      }
    }
    if (categoryName.includes('food') || categoryName.includes('restaurant') || categoryName.includes('dining')) {
      stats.foodExpenses++;
    }
  });

  stats.hasWeekendTracking = hasSaturday && hasSunday;
  stats.maxFridayExpenses = Math.max(...Object.values(fridayExpenses), 0);
  
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

// Get a celebration message
export function getCelebrationMessage() {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}

// Achievement unlock popup component
export function AchievementUnlock({ achievement, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50, rotate: -10 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.5, y: 50 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="bg-gradient-to-br from-accent/20 to-success/20 border border-accent/30 rounded-3xl p-8 max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-7xl mb-4"
        >
          {achievement.emoji}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-accent text-sm font-medium mb-2">
            {getCelebrationMessage()}
          </p>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {achievement.title}
          </h2>
          <p className="text-text-secondary mb-4">
            {achievement.description}
          </p>
          {achievement.unlockMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-surface-raised rounded-xl p-3 mb-4"
            >
              <RobotBuddy mood="celebrating" size="sm" showMessage={false} />
              <p className="text-text-secondary text-sm mt-2 italic">
                "{achievement.unlockMessage}"
              </p>
            </motion.div>
          )}
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onClose}
          className="px-6 py-3 bg-accent text-white rounded-xl font-semibold"
        >
          Awesome! 🎉
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Achievements page component
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
      className="fixed inset-0 bg-background z-50 overflow-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={onClose} className="text-text-secondary">
            ← Back
          </button>
          <h1 className="text-lg font-semibold">Achievements</h1>
          <div className="w-16 text-right text-text-muted text-sm">
            {unlocked.length}/{allAchievements.length}
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="px-6 py-4">
        <div className="bg-surface-raised rounded-2xl p-4 flex items-center gap-4">
          <RobotBuddy 
            mood={unlocked.length >= 10 ? 'proud' : unlocked.length >= 5 ? 'cool' : 'happy'} 
            size="md" 
            showMessage={false}
          />
          <div>
            <p className="text-text-primary font-semibold">
              {unlocked.length} badge{unlocked.length !== 1 ? 's' : ''} earned!
            </p>
            <p className="text-text-muted text-sm">
              {unlocked.length < 5 && "Just getting started!"}
              {unlocked.length >= 5 && unlocked.length < 10 && "You're on a roll!"}
              {unlocked.length >= 10 && unlocked.length < 20 && "Achievement hunter detected!"}
              {unlocked.length >= 20 && "Legendary collector status!"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Achievement Grid */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-3 gap-3">
          {visibleAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`
                  relative p-4 rounded-2xl text-center
                  ${isUnlocked 
                    ? 'bg-gradient-to-br from-accent/10 to-success/10 border border-accent/20' 
                    : 'bg-surface-raised opacity-50'}
                `}
              >
                <div className={`text-3xl mb-2 ${!isUnlocked && 'grayscale'}`}>
                  {isUnlocked ? achievement.emoji : '🔒'}
                </div>
                <p className={`text-xs font-medium ${isUnlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                  {isUnlocked ? achievement.title : '???'}
                </p>
                {isUnlocked && achievement.secret && (
                  <div className="absolute -top-1 -right-1 bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                    🤫
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {secretCount > 0 && (
          <p className="text-center text-text-muted text-sm mt-6">
            + {secretCount} secret achievement{secretCount !== 1 ? 's' : ''} to discover 🕵️
          </p>
        )}
      </div>
    </motion.div>
  );
}
