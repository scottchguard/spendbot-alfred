import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to SpendBot',
    subtitle: 'Track expenses in 3 seconds flat.',
    hint: 'No signup. No sync. Just you and your money.',
  },
  {
    emoji: '💸',
    title: 'Lightning Fast Entry',
    subtitle: 'Tap amount → Pick category → Done.',
    hint: 'Most expense apps take 30+ seconds. We take 3.',
  },
  {
    emoji: '📊',
    title: 'See Where It Goes',
    subtitle: 'Beautiful breakdowns by category.',
    hint: 'Finally understand your spending habits.',
  },
  {
    emoji: '🔥',
    title: 'Build Your Streak',
    subtitle: 'Track daily. Watch your streak grow.',
    hint: 'Small habits → big results.',
  },
  {
    emoji: '🔒',
    title: 'Private & Secure',
    subtitle: 'Your data is encrypted and protected.',
    hint: 'Synced securely to your account. We never sell your data.',
  },
];

function Step({ step, isActive }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: isActive ? 1 : 0.3, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="text-center px-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="text-7xl mb-6"
      >
        {step.emoji}
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-heading font-bold text-text-primary mb-3"
      >
        {step.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-text-secondary text-lg mb-2"
      >
        {step.subtitle}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-text-muted text-sm"
      >
        {step.hint}
      </motion.p>
    </motion.div>
  );
}

function ProgressDots({ current, total }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 24 : 8,
            backgroundColor: i === current ? '#6366F1' : '#374151',
          }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

export function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-text-muted text-sm hover:text-text-secondary transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <Step key={step} step={STEPS[step]} isActive={true} />
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-8 space-y-6">
        <ProgressDots current={step} total={STEPS.length} />
        
        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-accent text-white rounded-2xl font-semibold text-lg
                     shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-shadow"
        >
          {isLast ? "Let's Go! 🚀" : 'Continue'}
        </motion.button>
      </div>
    </motion.div>
  );
}
