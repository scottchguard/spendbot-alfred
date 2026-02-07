import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Delete, Check } from 'lucide-react';
import { addExpense, getCategories, Category, getMonthlyExpenseCount, getSettings } from '../db';
import SuccessAnimation from '../components/SuccessAnimation';

const FREE_LIMIT = 50;

export default function AddExpense() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [expenseCount, setExpenseCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

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

  const displayAmount = amount ? `$${(parseInt(amount) / 100).toFixed(2)}` : '$0.00';
  const isValid = amount && parseInt(amount) > 0 && selectedCategory;

  const handleNumberPress = useCallback((num: string) => {
    if (amount.length < 8) {
      setAmount(prev => prev + num);
    }
  }, [amount]);

  const handleDelete = useCallback(() => {
    setAmount(prev => prev.slice(0, -1));
  }, []);

  const handleSave = async () => {
    if (!isValid || !selectedCategory) return;

    // Check free limit
    if (!isPremium && expenseCount >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    await addExpense(parseInt(amount), selectedCategory);
    setShowSuccess(true);
    
    setTimeout(() => {
      navigate('/');
    }, 1200);
  };

  const selectedCat = categories.find(c => c.id === selectedCategory);

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
          className="p-2 rounded-full hover:bg-surface transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-text-secondary" />
        </button>
        <h1 className="text-lg font-semibold font-heading text-text-primary">Add Expense</h1>
        <button 
          onClick={() => navigate('/')}
          className="text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
        >
          Cancel
        </button>
      </motion.header>

      {/* Amount Display */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center px-6"
      >
        <motion.div
          key={amount}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="flex items-baseline justify-center mb-2"
        >
          <span className="text-[2rem] font-medium text-text-secondary mr-2 font-display">$</span>
          <span className="text-[3.5rem] font-bold font-display text-text-primary tracking-wide" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {amount ? (parseInt(amount) / 100).toFixed(2) : '0.00'}
          </span>
        </motion.div>
        <div className="w-[200px] h-[2px] bg-surface-elevated rounded-full mx-auto mb-8" />

        {/* Category Selector */}
        <div className="w-full max-w-md mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all min-w-[70px] ${
                  selectedCategory === cat.id 
                    ? 'bg-surface-raised ring-2 ring-accent' 
                    : 'bg-surface hover:bg-surface-raised'
                }`}
              >
                <span className="text-2xl mb-1">{cat.emoji}</span>
                <span className="text-xs text-text-secondary">{cat.name}</span>
              </motion.button>
            ))}
          </div>
          {selectedCat && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-accent mt-3 font-medium"
            >
              {selectedCat.emoji} {selectedCat.name}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Number Pad */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 pb-8"
      >
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'delete'].map((btn) => (
            <motion.button
              key={btn}
              whileTap={{ scale: 0.97, backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
              onClick={() => btn === 'delete' ? handleDelete() : handleNumberPress(btn)}
              className="h-[72px] rounded-2xl bg-surface text-text-primary text-[1.75rem] font-medium hover:bg-surface-raised transition-colors flex items-center justify-center"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {btn === 'delete' ? <Delete className="w-6 h-6 text-text-secondary" /> : btn}
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
          animate={isValid ? { 
            boxShadow: ['0 10px 30px -10px rgba(99, 102, 241, 0.3)', '0 10px 30px -10px rgba(99, 102, 241, 0.6)', '0 10px 30px -10px rgba(99, 102, 241, 0.3)']
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✓ Save Expense
        </motion.button>
      </motion.div>

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
            onClick={() => setShowPaywall(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-3xl p-8 max-w-sm w-full text-center"
            >
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold font-heading text-text-primary mb-2">
                You've tracked {FREE_LIMIT} expenses this month!
              </h2>
              <p className="text-text-secondary mb-6">
                That's more than 94% of users. You're clearly serious about your finances.
              </p>
              
              <div className="bg-surface-raised rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-text-primary mb-4">Unlock SpendBot Premium</h3>
                <ul className="text-left text-text-secondary space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" /> Unlimited expenses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" /> Custom categories
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" /> Budget alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" /> All future features
                  </li>
                </ul>
                <p className="text-2xl font-bold text-text-primary">$4.99 once. Forever.</p>
              </div>

              <button className="w-full h-14 bg-accent text-white rounded-2xl font-semibold hover:bg-accent-hover transition-colors mb-3">
                Upgrade Now
              </button>
              <button 
                onClick={() => setShowPaywall(false)}
                className="text-text-muted hover:text-text-secondary transition-colors"
              >
                Maybe later
              </button>
              <p className="text-text-muted text-sm mt-4">No subscription. Ever.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
