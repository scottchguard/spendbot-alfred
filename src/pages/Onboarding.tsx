import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { updateSettings } from '../db';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    emoji: '🤖',
    title: 'Welcome to SpendBot',
    description: 'Track your spending in seconds. No ads, no subscriptions, just simple expense tracking.',
  },
  {
    emoji: '⚡',
    title: 'Lightning Fast',
    description: 'Add expenses in under 3 seconds. Just tap the amount, pick a category, done!',
  },
  {
    emoji: '📊',
    title: 'Stay on Budget',
    description: 'Set monthly budgets and watch your progress. SpendBot helps you spend smarter.',
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await updateSettings({ onboardingComplete: true });
      onComplete();
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Dots */}
      <div className="flex justify-center gap-2 pt-12 pb-8">
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentStep ? 'w-8 bg-accent' : 'w-2 bg-surface'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="text-8xl mb-8"
            >
              {steps[currentStep].emoji}
            </motion.div>
            <h1 className="text-2xl font-bold font-heading text-text-primary mb-4">
              {steps[currentStep].title}
            </h1>
            <p className="text-text-secondary text-lg">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Button */}
      <div className="p-8">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full h-14 bg-accent text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors shadow-lg shadow-accent/30"
        >
          {isLastStep ? (
            <>
              <Check className="w-5 h-5" />
              Get Started
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
