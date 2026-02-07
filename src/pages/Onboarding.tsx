import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { updateSettings } from '../db';

interface OnboardingProps {
  onComplete: () => void;
}

// Phone mockup content components
function DashboardPreview() {
  return (
    <div className="p-3 text-center">
      <div className="text-[10px] text-text-secondary mb-1">February 2026</div>
      <div className="text-2xl font-bold font-display text-text-primary mb-2">$0.00</div>
      <div className="h-1 bg-surface-raised rounded-full mb-2 mx-4">
        <div className="h-full w-0 bg-accent rounded-full" />
      </div>
      <div className="text-[8px] text-text-muted mb-3">Start Fresh</div>
      <div className="mx-4 py-1.5 bg-accent/20 rounded-lg text-[9px] text-accent font-medium">
        + Add Expense
      </div>
    </div>
  );
}

function AddExpensePreview() {
  return (
    <div className="p-3 text-center">
      <div className="text-2xl font-bold font-display text-text-primary mb-2">
        <span className="text-text-secondary text-lg">$</span> 45.00
      </div>
      <div className="h-px bg-surface-elevated mx-8 mb-3" />
      <div className="flex justify-center gap-2 mb-3">
        {['🍔', '🚗', '🛒', '🎬'].map((e) => (
          <div key={e} className="w-7 h-7 rounded-lg bg-surface-raised flex items-center justify-center text-xs">
            {e}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 mx-3">
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <div key={n} className="py-1 bg-surface-raised rounded text-[10px] text-text-primary text-center font-medium">
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

function PremiumPreview() {
  return (
    <div className="p-3 text-center">
      <div className="text-xs mb-1">✨</div>
      <div className="text-[10px] font-semibold text-accent mb-1">Premium</div>
      <div className="text-lg font-bold font-display text-text-primary mb-2">$4.99</div>
      <div className="text-[8px] text-text-muted mb-2 uppercase tracking-wider">One time</div>
      <div className="space-y-1.5 text-left mx-3">
        {['Unlimited expenses', 'Smart insights', 'CSV export'].map((f) => (
          <div key={f} className="flex items-center gap-1.5 text-[9px] text-text-secondary">
            <span className="text-accent">✓</span> {f}
          </div>
        ))}
      </div>
    </div>
  );
}

const steps = [
  {
    mockup: <DashboardPreview />,
    emoji: '🤖',
    headline: 'Zero-friction tracking',
    subhead: "One tap. No spreadsheets. Finally, budgeting that doesn't feel like work.",
  },
  {
    mockup: <AddExpensePreview />,
    emoji: '📱',
    headline: 'See where every dollar goes',
    subhead: 'Pick a category, tap the amount, done. Faster than opening a spreadsheet.',
  },
  {
    mockup: <PremiumPreview />,
    emoji: '💰',
    headline: 'No subscriptions. Ever.',
    subhead: '$4.99 once. Yours forever. While others charge $100/year, we believe in fair pricing.',
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

  const handleSkip = async () => {
    await updateSettings({ onboardingComplete: true });
    onComplete();
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-[100dvh] flex flex-col p-8 bg-background">
      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'w-6 bg-accent'
                : 'w-2 bg-text-muted'
            }`}
            layout
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {/* Phone Mockup */}
            <div className="w-[200px] h-[400px] mb-6 rounded-3xl border-[3px] border-surface-elevated bg-surface overflow-hidden"
              style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}
            >
              <div className="h-full flex items-center justify-center">
                {steps[currentStep].mockup}
              </div>
            </div>

            {/* Robot Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="text-5xl mb-4"
            >
              {steps[currentStep].emoji}
            </motion.div>

            {/* Headline */}
            <h1 className="text-[1.75rem] font-bold text-text-primary mb-2 leading-tight">
              {steps[currentStep].headline}
            </h1>

            {/* Subhead */}
            <p className="text-base text-text-secondary max-w-[280px]">
              {steps[currentStep].subhead}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="mt-12 space-y-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={`w-full h-14 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${
            isLastStep
              ? 'bg-gradient-to-br from-accent to-[#8B5CF6] shadow-glow'
              : 'bg-accent hover:bg-accent-hover shadow-lg shadow-accent/30'
          }`}
        >
          {isLastStep ? (
            <>
              Get Started
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {!isLastStep && (
          <button
            onClick={handleSkip}
            className="w-full py-3 text-text-muted text-sm hover:text-text-secondary transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
