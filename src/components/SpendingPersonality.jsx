import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/format';

/**
 * Spending Personality - What kind of spender are you?
 * 
 * Analyzes your spending patterns and gives you a 
 * completely unscientific but very fun personality type.
 */

const PERSONALITIES = {
  zen_master: {
    id: 'zen_master',
    title: 'The Zen Master',
    emoji: '🧘',
    vibe: 'Enlightened',
    description: 'You spend with intention and awareness. Your budget is a meditation practice.',
    traits: ['Mindful', 'Balanced', 'Intentional'],
    advice: 'Keep doing what you\'re doing. You\'ve cracked the code.',
    color: 'from-green-500/20 to-teal-500/20',
    borderColor: 'border-green-500/30',
  },
  impulse_gremlin: {
    id: 'impulse_gremlin',
    title: 'The Impulse Gremlin',
    emoji: '👹',
    vibe: 'Chaotic',
    description: 'You see. You want. You buy. The cart button fears you.',
    traits: ['Spontaneous', 'Adventurous', 'YOLO'],
    advice: 'Maybe sleep on purchases over $50? Just a thought.',
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-500/30',
  },
  coffee_cultist: {
    id: 'coffee_cultist',
    title: 'The Caffeine Cultist',
    emoji: '☕',
    vibe: 'Wired',
    description: 'Your bloodstream is 40% espresso. Baristas know your order by heart.',
    traits: ['Caffeinated', 'Loyal', 'Slightly Jittery'],
    advice: 'Have you considered... a coffee machine at home? No? Okay.',
    color: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-500/30',
  },
  food_philosopher: {
    id: 'food_philosopher',
    title: 'The Food Philosopher',
    emoji: '🍕',
    vibe: 'Hungry',
    description: 'Life\'s too short for bad meals. Your food budget is an investment in happiness.',
    traits: ['Foodie', 'Social', 'Well-Fed'],
    advice: 'Meal prep could save you money. But will it save your soul?',
    color: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/30',
  },
  subscription_collector: {
    id: 'subscription_collector',
    title: 'The Subscription Collector',
    emoji: '📱',
    vibe: 'Subscribed',
    description: 'You have apps for apps. Your monthly recurring charges have recurring charges.',
    traits: ['Modern', 'Connected', 'Possibly Forgetting Half of Them'],
    advice: 'When\'s the last time you audited your subscriptions? Exactly.',
    color: 'from-blue-500/20 to-purple-500/20',
    borderColor: 'border-blue-500/30',
  },
  retail_therapist: {
    id: 'retail_therapist',
    title: 'The Retail Therapist',
    emoji: '🛍️',
    vibe: 'Therapeutic',
    description: 'Shopping isn\'t a hobby, it\'s a coping mechanism. And it\'s working.',
    traits: ['Stylish', 'Emotional', 'Well-Dressed'],
    advice: 'Your feelings are valid. Your cart, however...',
    color: 'from-pink-500/20 to-purple-500/20',
    borderColor: 'border-pink-500/30',
  },
  frugal_legend: {
    id: 'frugal_legend',
    title: 'The Frugal Legend',
    emoji: '🦸',
    vibe: 'Legendary',
    description: 'You squeeze every penny until it screams. Coupons fear you.',
    traits: ['Resourceful', 'Strategic', 'Slightly Intense'],
    advice: 'It\'s okay to treat yourself sometimes. The budget will survive.',
    color: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/30',
  },
  night_shopper: {
    id: 'night_shopper',
    title: 'The Midnight Marauder',
    emoji: '🌙',
    vibe: 'Nocturnal',
    description: '2 AM purchases hit different. Your cart knows your insomnia schedule.',
    traits: ['Night Owl', 'Impulsive', 'Regretful by Morning'],
    advice: 'Put the phone down after 11 PM. Trust me.',
    color: 'from-indigo-500/20 to-purple-500/20',
    borderColor: 'border-indigo-500/30',
  },
  balanced_adult: {
    id: 'balanced_adult',
    title: 'The Functional Adult',
    emoji: '📊',
    vibe: 'Responsible',
    description: 'You budget. You track. You adult. Your parents would be proud.',
    traits: ['Organized', 'Mature', 'Slightly Boring (Affectionate)'],
    advice: 'You\'re doing great. Maybe live a little? Or don\'t. You do you.',
    color: 'from-slate-500/20 to-gray-500/20',
    borderColor: 'border-slate-500/30',
  },
  mystery_spender: {
    id: 'mystery_spender',
    title: 'The Enigma',
    emoji: '🎭',
    vibe: 'Mysterious',
    description: 'Your spending patterns defy analysis. You are chaos incarnate.',
    traits: ['Unpredictable', 'Unique', 'Confusing My Algorithms'],
    advice: 'I genuinely don\'t know what to tell you. Good luck?',
    color: 'from-violet-500/20 to-fuchsia-500/20',
    borderColor: 'border-violet-500/30',
  },
};

// Analyze spending and determine personality
export function analyzeSpendingPersonality(expenses, settings = {}) {
  if (!expenses || expenses.length < 5) {
    return null; // Need more data
  }

  const stats = {
    totalExpenses: expenses.length,
    avgAmount: 0,
    topCategories: {},
    timePatterns: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    weekendRatio: 0,
    smallPurchases: 0,
    largePurchases: 0,
    streakDays: settings?.streakData?.currentStreak || 0,
    underBudget: settings?.monthsUnderBudget || 0,
  };

  let totalAmount = 0;
  let weekendExpenses = 0;

  expenses.forEach(expense => {
    totalAmount += expense.amount;
    
    // Category tracking
    const cat = expense.category?.toLowerCase() || 'other';
    stats.topCategories[cat] = (stats.topCategories[cat] || 0) + 1;
    
    // Time patterns
    const date = new Date(expense.date || expense.created_at);
    const hour = date.getHours();
    const day = date.getDay();
    
    if (hour >= 5 && hour < 12) stats.timePatterns.morning++;
    else if (hour >= 12 && hour < 17) stats.timePatterns.afternoon++;
    else if (hour >= 17 && hour < 22) stats.timePatterns.evening++;
    else stats.timePatterns.night++;
    
    if (day === 0 || day === 6) weekendExpenses++;
    
    // Size tracking
    if (expense.amount < 1000) stats.smallPurchases++; // Under $10
    if (expense.amount > 10000) stats.largePurchases++; // Over $100
  });

  stats.avgAmount = totalAmount / expenses.length;
  stats.weekendRatio = weekendExpenses / expenses.length;

  // Determine personality based on patterns
  const topCategory = Object.entries(stats.topCategories)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  // Night owl check
  if (stats.timePatterns.night > expenses.length * 0.3) {
    return PERSONALITIES.night_shopper;
  }

  // Coffee addict check
  if (topCategory?.includes('coffee') || topCategory?.includes('cafe')) {
    return PERSONALITIES.coffee_cultist;
  }

  // Food lover check
  if (topCategory?.includes('food') || topCategory?.includes('restaurant')) {
    return PERSONALITIES.food_philosopher;
  }

  // Shopping check
  if (topCategory?.includes('shopping') || topCategory?.includes('retail')) {
    return PERSONALITIES.retail_therapist;
  }

  // Frugal check
  if (stats.underBudget >= 2 && stats.avgAmount < 2000) {
    return PERSONALITIES.frugal_legend;
  }

  // Zen master (consistent tracker, under budget)
  if (stats.streakDays >= 14 && stats.underBudget >= 1) {
    return PERSONALITIES.zen_master;
  }

  // Balanced adult (consistent, moderate spending)
  if (stats.streakDays >= 7 && stats.avgAmount < 5000) {
    return PERSONALITIES.balanced_adult;
  }

  // Impulse gremlin (lots of small purchases)
  if (stats.smallPurchases > expenses.length * 0.6) {
    return PERSONALITIES.impulse_gremlin;
  }

  // Default to mystery
  return PERSONALITIES.mystery_spender;
}

// Personality Card Component
export function SpendingPersonalityCard({ expenses, settings, onClose }) {
  const [revealed, setRevealed] = useState(false);
  const personality = useMemo(() => analyzeSpendingPersonality(expenses, settings), [expenses, settings]);

  if (!personality) {
    return (
      <div className="bg-surface-raised rounded-2xl p-6 text-center">
        <span className="text-4xl mb-3 block">🔍</span>
        <p className="text-text-secondary">
          Track at least 5 expenses to unlock your Spending Personality!
        </p>
        <p className="text-text-muted text-sm mt-2">
          ({expenses?.length || 0}/5 logged)
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${personality.color} border ${personality.borderColor} rounded-2xl p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-muted">Your Spending Personality</h3>
        {onClose && (
          <button onClick={onClose} className="text-text-muted hover:text-text-secondary">✕</button>
        )}
      </div>

      {!revealed ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRevealed(true)}
          className="w-full py-6 bg-white/5 rounded-xl border border-white/10 text-center"
        >
          <span className="text-4xl block mb-2">🎭</span>
          <span className="text-text-primary font-medium">Reveal Your Type</span>
          <p className="text-text-muted text-xs mt-1">Based on your spending patterns</p>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <div className="text-center mb-4">
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="text-6xl block mb-3"
            >
              {personality.emoji}
            </motion.span>
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              {personality.title}
            </h2>
            <span className="text-sm text-text-muted">Vibe: {personality.vibe}</span>
          </div>

          <p className="text-text-secondary text-center mb-4 italic">
            "{personality.description}"
          </p>

          <div className="flex justify-center gap-2 mb-4">
            {personality.traits.map((trait, i) => (
              <motion.span
                key={trait}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="px-3 py-1 bg-white/10 rounded-full text-xs text-text-secondary"
              >
                {trait}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-black/20 rounded-xl p-3 text-center"
          >
            <p className="text-xs text-text-muted mb-1">💡 Robot's Advice:</p>
            <p className="text-sm text-text-secondary">{personality.advice}</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Mini personality badge
export function PersonalityBadge({ expenses, settings }) {
  const personality = analyzeSpendingPersonality(expenses, settings);
  
  if (!personality) return null;
  
  return (
    <div className="flex items-center gap-2">
      <span>{personality.emoji}</span>
      <span className="text-sm text-text-muted">{personality.title}</span>
    </div>
  );
}

export { PERSONALITIES };
