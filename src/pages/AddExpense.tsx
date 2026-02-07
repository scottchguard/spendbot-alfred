import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Delete } from 'lucide-react';
import { addExpense, getCategories, Category, getMonthlyExpenseCount, getSettings } from '../db';
import SuccessAnimation from '../components/SuccessAnimation';
import PaywallModal from '../components/PaywallModal';

const FREE_LIMIT = 50;

// Quick suggestion presets (could be driven by history later)
const QUICK_SUGGESTIONS = [
  { categoryId: 'coffee', icon: '☕', amount: 600 },
  { categoryId: 'food', icon: '🍔', amount: 1500 },
  { categoryId: 'transport', icon: '🚗', amount: 2500 },
];

export default function AddExpense() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [expenseCount, setExpenseCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [note, setNote] = useState('');
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const [cats, settings] = await Promise.all([
        getCategories(),
        getSettings(),
      ]);
      setCategories(cats);
      setIsPremium(settings?.isPremium || false);

      const now = new Date();
      const count = await getMonthlyExpenseCount(now.getFullYear(), now.getMonth());
      setExpenseCount(count);
    }
    load();
  }, []);

  const isValid = amount && parseInt(amount) > 0 && selectedCategory;

  const handleNumberPress = useCallback((num: string) => {
    if (amount.length < 8) {
      setAmount(prev => prev + num);
      // Haptic feedback
      if ('vibrate' in navigator) navigator.vibrate(10);
    }
  }, [amount]);

  const handleDelete = useCallback(() => {
    setAmount(prev => prev.slice(0, -1));
    if ('vibrate' in navigator) navigator.vibrate(10);
  }, []);

  const handleQuickSuggestion = (categoryId: string, sugAmount: number) => {
    setSelectedCategory(categoryId);
    setAmount(sugAmount.toString());
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleSave = async () => {
    if (!isValid || !selectedCategory) return;

    if (!isPremium && expenseCount >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    await addExpense(parseInt(amount), selectedCategory, note || undefined);
    setShowSuccess(true);

    setTimeout(() => {
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence>
        {showSuccess && <SuccessAnimation />}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-text-secondary" />
        </button>
        <h1 className="text-lg font-semibold font-heading text-text-primary">Add Expense</h1>
        <button
          onClick={() => navigate('/')}
          className="text-text-secondary px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </motion.header>

      {/* Amount Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 px-4"
      >
        <motion.div
          key={amount}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex items-baseline justify-center mb-3"
        >
          <span className="text-[2rem] font-medium text-text-secondary mr-2 font-display">$</span>
          <span
            className="text-[3.5rem] font-bold font-display text-text-primary"
            style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em' }}
          >
            {amount ? (parseInt(amount) / 100).toFixed(2) : '0.00'}
          </span>
        </motion.div>
        <div className="w-[200px] h-[2px] bg-surface-elevated rounded-full mx-auto" />
      </motion.div>

      {/* Quick Suggestions */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {QUICK_SUGGESTIONS.map((s) => (
          <motion.button
            key={`${s.categoryId}-${s.amount}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickSuggestion(s.categoryId, s.amount)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-surface-raised rounded-full border border-surface-elevated text-sm text-text-primary active:bg-surface-elevated transition-colors"
          >
            <span>{s.icon}</span>
            ${(s.amount / 100).toFixed(0)}
          </motion.button>
        ))}
      </div>

      {/* Category Selector — horizontal scroll with fade edges */}
      <div className="relative py-3">
        {/* Fade edges */}
        <div className="absolute top-0 bottom-0 left-0 w-6 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, #08080C, transparent)' }} />
        <div className="absolute top-0 bottom-0 right-0 w-6 z-10 pointer-events-none" style={{ background: 'linear-gradient(-90deg, #08080C, transparent)' }} />

        <div
          ref={categoryScrollRef}
          className="flex gap-3 px-4 overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex-shrink-0 flex flex-col items-center gap-2"
              style={{ scrollSnapAlign: 'center' }}
            >
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl border-2 transition-all ${
                  selectedCategory === cat.id
                    ? 'border-accent'
                    : 'border-transparent'
                }`}
                style={{
                  background: selectedCategory === cat.id
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'var(--bg-card, #18181F)',
                }}
              >
                {cat.emoji}
              </div>
              <span
                className={`text-xs max-w-[60px] text-center truncate ${
                  selectedCategory === cat.id
                    ? 'text-accent font-medium'
                    : 'text-text-secondary'
                }`}
              >
                {cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Number Pad */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 pb-4"
      >
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'delete'].map((btn) => (
            <motion.button
              key={btn}
              whileTap={{ scale: 0.97 }}
              onClick={() => btn === 'delete' ? handleDelete() : handleNumberPress(btn)}
              className={`h-[72px] rounded-2xl bg-surface text-text-primary text-[1.75rem] font-medium flex items-center justify-center active:bg-surface-elevated transition-colors ${
                btn === 'delete' ? 'text-text-secondary' : ''
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {btn === 'delete' ? <Delete className="w-6 h-6" /> : btn}
            </motion.button>
          ))}
        </div>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={!isValid}
          className={`w-full max-w-sm mx-auto h-14 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            isValid
              ? 'text-white'
              : 'bg-surface text-text-muted cursor-not-allowed'
          }`}
          style={isValid ? {
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          } : {}}
        >
          ✓ Save Expense
        </motion.button>
      </motion.div>

      {/* Safe area bottom padding */}
      <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <PaywallModal
            onDismiss={() => setShowPaywall(false)}
            expenseCount={expenseCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
