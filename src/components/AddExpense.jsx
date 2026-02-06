import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NumberPad } from './NumberPad';
import { CategorySelector } from './CategorySelector';
import { Confetti } from './Confetti';
import { formatCurrency } from '../utils/format';
import { QuickAdd } from './QuickAdd';

export function AddExpense({ categories, onSave, onClose, expenses = [] }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const isValid = amountCents > 0 && category !== null;

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
    setError(null);
    
    const result = await onSave(amountCents, category.id);
    
    if (result.success) {
      setSuccess(true);
      
      // Wait 800ms then close
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setSaving(false);
      // Show error message if it's a timeout or other error (not limit reached - that shows paywall)
      if (result.error && !result.limitReached) {
        setError(result.error);
        // Auto-clear error after 4 seconds
        setTimeout(() => setError(null), 4000);
      }
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
        <button 
          onClick={onClose} 
          className="text-text-secondary text-lg"
          aria-label="Cancel and close"
        >
          Cancel
        </button>
        <span className="text-text-muted text-sm" id="add-expense-title">Add Expense</span>
        <div className="w-16" aria-hidden="true" />
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

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 pb-2"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
