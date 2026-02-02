import { motion } from 'framer-motion';

/**
 * WelcomeCard - Warm welcome for new users with empty dashboards
 */
export function WelcomeCard({ userName, expenseCount, onAddClick }) {
  // Different messages based on progress
  const getMessage = () => {
    if (expenseCount === 0) {
      return {
        emoji: '👋',
        title: `Hey${userName ? ` ${userName.split(' ')[0]}` : ''}!`,
        subtitle: "Ready to take control of your spending?",
        cta: "Log your first expense",
        tip: "Most people start with their morning coffee ☕"
      };
    } else if (expenseCount < 5) {
      return {
        emoji: '🌱',
        title: "Great start!",
        subtitle: `${expenseCount} expense${expenseCount > 1 ? 's' : ''} tracked. Keep it up!`,
        cta: "Add another",
        tip: "Tip: The more you track, the smarter your insights get"
      };
    } else if (expenseCount < 10) {
      return {
        emoji: '🚀',
        title: "You're on a roll!",
        subtitle: "Your spending patterns are starting to emerge",
        cta: "Keep going",
        tip: "Check back in a week for personalized insights"
      };
    }
    return null; // Don't show after 10 expenses
  };

  const message = getMessage();
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-2xl p-6 mb-6 border border-accent/20"
    >
      <div className="text-center">
        <motion.div 
          className="text-5xl mb-3"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            repeatDelay: 3 
          }}
        >
          {message.emoji}
        </motion.div>
        
        <h2 className="text-xl font-heading font-bold text-text-primary mb-1">
          {message.title}
        </h2>
        
        <p className="text-text-secondary mb-4">
          {message.subtitle}
        </p>
        
        <motion.button
          onClick={onAddClick}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-accent text-white rounded-xl font-semibold shadow-lg shadow-accent/30 mb-3"
        >
          {message.cta} →
        </motion.button>
        
        <p className="text-xs text-text-muted">
          {message.tip}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * EmptyState - Friendly empty state for various screens
 */
export function EmptyState({ 
  emoji = '🤖', 
  title, 
  subtitle, 
  action,
  onAction 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <motion.div 
        className="text-6xl mb-4"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {emoji}
      </motion.div>
      
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>
      
      <p className="text-text-secondary text-sm mb-4 max-w-xs">
        {subtitle}
      </p>
      
      {action && onAction && (
        <button
          onClick={onAction}
          className="text-accent font-medium"
        >
          {action}
        </button>
      )}
    </motion.div>
  );
}

/**
 * MilestoneToast - Celebration for hitting milestones
 */
export function MilestoneToast({ milestone, onDismiss }) {
  const milestones = {
    first_expense: { emoji: '🎉', text: "First expense logged!" },
    streak_3: { emoji: '🔥', text: "3-day streak! Keep it up!" },
    streak_7: { emoji: '⚡', text: "7-day streak! You're on fire!" },
    streak_30: { emoji: '🏆', text: "30-day streak! Legendary!" },
    expenses_10: { emoji: '📊', text: "10 expenses tracked!" },
    expenses_50: { emoji: '💪', text: "50 expenses! Pro tracker!" },
    expenses_100: { emoji: '🌟', text: "100 expenses! You're amazing!" },
    first_week: { emoji: '📅', text: "One week of tracking!" },
    first_month: { emoji: '🗓️', text: "One month of tracking!" },
    under_budget: { emoji: '💰', text: "Under budget this month!" },
  };

  const m = milestones[milestone];
  if (!m) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 left-4 right-4 z-50 bg-gradient-to-r from-accent to-purple-500 
                 rounded-2xl p-4 shadow-xl flex items-center gap-3"
      onClick={onDismiss}
    >
      <span className="text-3xl">{m.emoji}</span>
      <span className="text-white font-semibold flex-1">{m.text}</span>
      <span className="text-white/60 text-sm">Tap to dismiss</span>
    </motion.div>
  );
}
