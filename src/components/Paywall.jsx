import { motion } from 'framer-motion';

const FEATURES = [
  { emoji: '♾️', text: 'Unlimited expenses' },
  { emoji: '📊', text: 'Advanced insights' },
  { emoji: '🎨', text: 'Custom categories' },
  { emoji: '☁️', text: 'Cloud backup (coming soon)' },
  { emoji: '💚', text: 'Support indie development' },
];

export function Paywall({ monthCount, onUpgrade, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface-raised rounded-t-3xl w-full max-w-lg p-6 pb-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
            You're on Fire!
          </h2>
          <p className="text-text-secondary">
            You've tracked <span className="text-accent font-semibold">{monthCount}</span> expenses this month.
            <br />
            Upgrade to keep the momentum going!
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 bg-background/50 rounded-xl p-3"
            >
              <span className="text-xl">{feature.emoji}</span>
              <span className="text-text-primary">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-text-primary">$4.99</span>
            <span className="text-text-muted">/month</span>
          </div>
          <p className="text-text-muted text-sm mt-1">
            Cancel anytime. Less than a coffee ☕
          </p>
        </div>

        {/* CTA */}
        <motion.button
          onClick={onUpgrade}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-accent to-purple-500 text-white 
                     rounded-2xl font-semibold text-lg shadow-lg shadow-accent/30"
        >
          Upgrade to Premium
        </motion.button>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="w-full py-3 text-text-muted text-sm mt-3"
        >
          Maybe Later
        </button>
      </motion.div>
    </motion.div>
  );
}
