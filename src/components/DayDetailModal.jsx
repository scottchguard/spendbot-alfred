import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/format';
import { RobotBuddy } from './RobotBuddy';
import { GlassCard } from './ui';

/**
 * Modal showing expenses for a selected day
 */

// Robot messages based on daily spending
const DAY_MESSAGES = {
  zero: [
    "A zero day! Your wallet is healing. 🙏",
    "No expenses?! Who ARE you today?",
    "The rare and beautiful $0 day. Chef's kiss.",
    "Your credit card is getting suspicious of this good behavior.",
    "Future you just sent a thank you note.",
  ],
  low: [
    "Responsible spending! I approve.",
    "Look at you being all financially mature.",
    "This is what discipline looks like. Take notes.",
    "Your budget called. It's happy.",
    "Modest spending energy. Love it.",
  ],
  medium: [
    "Pretty average day. Nothing to see here.",
    "Standard spending. The robot is neutral.",
    "Could be better, could be worse. It's fine.",
    "Middle of the road. Acceptable.",
    "The 'meh' of spending days.",
  ],
  high: [
    "Getting a little spicy with the spending...",
    "Your wallet felt that one.",
    "Big spender energy today, huh?",
    "The budget is sweating a little.",
    "Okay okay, I see you spending.",
  ],
  extreme: [
    "I have CONCERNS but I'm not your mom.",
    "What happened here? Actually, don't tell me.",
    "We don't talk about this day.",
    "Your bank account needs therapy after this.",
    "Bold financial choices were made.",
  ],
};

function getRandomMessage(level) {
  const messages = DAY_MESSAGES[level] || DAY_MESSAGES.medium;
  return messages[Math.floor(Math.random() * messages.length)];
}

function getMoodForLevel(level) {
  switch (level) {
    case 'zero':
    case 'low':
      return 'happy';
    case 'medium':
      return 'neutral';
    case 'high':
      return 'surprised';
    case 'extreme':
      return 'worried';
    default:
      return 'happy';
  }
}

function getSpendingLevel(amount, dailyBudget, avgDaily) {
  if (amount === 0) return 'zero';
  
  const baseline = dailyBudget || avgDaily || 50;
  const percentage = (amount / baseline) * 100;
  
  if (percentage < 30) return 'low';
  if (percentage < 60) return 'medium';
  if (percentage < 100) return 'high';
  return 'extreme';
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00'); // Noon to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function ExpenseRow({ expense, category }) {
  const time = new Date(expense.created_at || expense.date);
  const timeStr = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
    >
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
        <span className="text-lg">{category?.emoji || '📦'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary font-medium truncate">
          {category?.name || 'Other'}
        </p>
        <p className="text-xs text-text-muted">{timeStr}</p>
      </div>
      <p className="text-sm font-semibold text-text-primary">
        -{formatCurrency(expense.amount)}
      </p>
    </motion.div>
  );
}

export function DayDetailModal({
  isOpen,
  onClose,
  dateStr,
  expenses,
  categories,
  dailyBudget,
  avgDaily,
}) {
  if (!isOpen || !dateStr) return null;
  
  const dayExpenses = expenses.filter(e => e.date?.startsWith(dateStr));
  const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const level = getSpendingLevel(total, dailyBudget, avgDaily);
  const mood = getMoodForLevel(level);
  const message = getRandomMessage(level);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-hidden
                       bg-gradient-to-b from-surface-raised to-background
                       rounded-t-3xl border-t border-white/10"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>
            
            {/* Header */}
            <div className="px-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    {formatDate(dateStr)}
                  </h2>
                  <p className="text-text-muted text-sm mt-1">
                    {dayExpenses.length} transaction{dayExpenses.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-text-primary">
                    {formatCurrency(total)}
                  </p>
                  {dailyBudget && (
                    <p className="text-xs text-text-muted">
                      of {formatCurrency(dailyBudget)} budget
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Robot Commentary */}
            <div className="px-6 pb-4">
              <GlassCard variant="subtle" className="flex items-center gap-3">
                <RobotBuddy mood={mood} size="sm" />
                <p className="text-sm text-text-secondary flex-1">{message}</p>
              </GlassCard>
            </div>
            
            {/* Expenses List */}
            <div className="px-6 pb-8 overflow-y-auto max-h-[40vh]">
              {dayExpenses.length > 0 ? (
                <div>
                  {dayExpenses
                    .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
                    .map((expense, i) => (
                      <ExpenseRow
                        key={expense.id || i}
                        expense={expense}
                        category={categories.find(c => c.id === expense.category_id)}
                      />
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">✨</p>
                  <p className="text-text-muted">No expenses recorded</p>
                  <p className="text-sm text-text-muted mt-1">
                    A clean slate! Or you forgot to log. No judgment.
                  </p>
                </div>
              )}
            </div>
            
            {/* Close Button */}
            <div className="px-6 pb-8">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/10 text-text-primary font-medium"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DayDetailModal;
