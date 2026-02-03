import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NumberPad } from './NumberPad';
import { CategorySelector } from './CategorySelector';
import { Confetti } from './Confetti';
import { formatCurrency } from '../utils/format';
import { RobotBuddy, getRandomMessage, getCategoryPun } from './RobotBuddy';
import { QuickAdd } from './QuickAdd';
import { getSpendingRoast, AlternativeSpendingBadge } from './SpendingRoasts';

export function AddExpense({ categories, onSave, onClose, canAdd, expenses = [] }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [robotReaction, setRobotReaction] = useState(null);
  const [robotMood, setRobotMood] = useState('happy');
  const [showAlternative, setShowAlternative] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);

  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const amountDollars = amountCents / 100;
  const isValid = amountCents > 0 && category !== null;

  // Get robot reaction based on amount and category
  const getRobotReaction = (dollars, categoryName = null) => {
    // For larger amounts, use the roast system (50% chance)
    if (dollars >= 20 && Math.random() < 0.5) {
      const roast = getSpendingRoast(dollars * 100, categoryName); // Convert to cents
      if (roast) {
        const mood = dollars >= 100 ? 'worried' : dollars >= 50 ? 'surprised' : 'happy';
        return { mood, message: roast, showAlternative: dollars >= 50 };
      }
    }
    
    // 30% chance to use category pun if category is known
    if (categoryName && Math.random() < 0.3) {
      return { mood: 'happy', message: getCategoryPun(categoryName) };
    }
    
    if (dollars < 10) return { mood: 'happy', type: 'smallExpense' };
    if (dollars < 50) return { mood: 'happy', type: 'mediumExpense' };
    if (dollars < 200) return { mood: 'surprised', type: 'largeExpense' };
    return { mood: 'worried', type: 'hugeExpense' };
  };

  const handleInput = (value) => {
    if (value === '.' && amount.includes('.')) return;
    if (amount.includes('.') && amount.split('.')[1]?.length >= 2) return;
    if (amount === '0' && value !== '.') {
      setAmount(value);
    } else {
      setAmount(prev => prev + value);
    }
  };

  const handleDelete = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    
    const result = await onSave(amountCents, category.id);
    
    if (result.success) {
      // Get robot reaction based on amount and category
      const reaction = getRobotReaction(amountDollars, category?.name);
      setRobotMood(reaction.mood);
      setRobotReaction(reaction.message || getRandomMessage(reaction.type));
      setSavedAmount(amountDollars);
      setShowAlternative(reaction.showAlternative || false);
      setSuccess(true);
      
      // Wait 800ms then close
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setSaving(false);
      // TODO: Show paywall
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Confetti celebration */}
      <Confetti show={success} emoji={category?.emoji} />
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onClose} className="text-text-secondary text-lg">
          Cancel
        </button>
        <span className="text-text-muted text-sm">Add Expense</span>
        <div className="w-16" />
      </div>

      {/* Amount Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Clean success confirmation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-success text-2xl font-semibold"
              >
                Expense saved ✓
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                key={amount}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="font-display text-5xl md:text-6xl font-bold text-text-primary"
              >
                {formatCurrency(amountCents)}
              </motion.div>
              {category && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-text-secondary"
                >
                  {category.emoji} {category.name}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Add Suggestions */}
      {!success && expenses.length >= 3 && !amount && (
        <div className="px-4 pb-2">
          <QuickAdd
            expenses={expenses}
            categories={categories}
            onQuickAdd={async ({ amount, categoryId }) => {
              // Quick add bypasses manual entry
              setSaving(true);
              const result = await onSave(amount, categoryId);
              if (result.success) {
                const cat = categories.find(c => c.id === categoryId);
                setCategory(cat);
                const reaction = getRobotReaction(amount / 100);
                setRobotMood(reaction.mood);
                setRobotReaction(getRandomMessage(reaction.type));
                setSuccess(true);
                setTimeout(() => onClose(), 800);
              } else {
                setSaving(false);
              }
            }}
          />
        </div>
      )}

      {/* Category Selector */}
      {!success && (
        <div className="py-4">
          <CategorySelector
            categories={categories}
            selected={category}
            onSelect={setCategory}
          />
        </div>
      )}

      {/* Number Pad */}
      {!success && (
        <NumberPad onInput={handleInput} onDelete={handleDelete} />
      )}

      {/* Save Button */}
      <div className="px-6 pb-8">
        {!success && (
          <motion.button
            onClick={handleSave}
            disabled={!isValid || saving}
            animate={isValid ? { 
              boxShadow: ['0 0 20px rgba(99,102,241,0.4)', '0 0 40px rgba(99,102,241,0.6)', '0 0 20px rgba(99,102,241,0.4)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`
              w-full py-4 rounded-2xl text-lg font-semibold
              transition-all duration-300
              ${isValid 
                ? 'bg-accent text-white' 
                : 'bg-surface-raised text-text-muted'}
            `}
          >
            {saving ? 'Saving...' : 'Save Expense'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
