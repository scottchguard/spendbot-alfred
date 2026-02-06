import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Delete, Check, Trash2 } from 'lucide-react';
import { updateExpense, deleteExpense, getExpenseById, getCategories, Category, Expense } from '../db';
import SuccessAnimation from '../components/SuccessAnimation';

export default function EditExpense() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [originalExpense, setOriginalExpense] = useState<Expense | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        navigate('/history');
        return;
      }

      const [expense, cats] = await Promise.all([
        getExpenseById(id),
        getCategories(),
      ]);

      if (!expense) {
        navigate('/history');
        return;
      }

      setOriginalExpense(expense);
      setAmount(expense.amount.toString());
      setSelectedCategory(expense.categoryId);
      setCategories(cats);
      setIsLoading(false);
    }
    load();
  }, [id, navigate]);

  const displayAmount = amount ? `$${(parseInt(amount) / 100).toFixed(2)}` : '$0.00';
  const isValid = amount && parseInt(amount) > 0 && selectedCategory;

  // Check if anything has changed
  const hasChanges = originalExpense && (
    parseInt(amount) !== originalExpense.amount ||
    selectedCategory !== originalExpense.categoryId
  );

  const handleNumberPress = useCallback((num: string) => {
    if (amount.length < 8) {
      setAmount(prev => prev + num);
    }
  }, [amount]);

  const handleDelete = useCallback(() => {
    setAmount(prev => prev.slice(0, -1));
  }, []);

  const handleSave = async () => {
    if (!isValid || !selectedCategory || !id) return;

    await updateExpense(id, {
      amount: parseInt(amount),
      categoryId: selectedCategory,
    });

    setShowSuccess(true);
    
    setTimeout(() => {
      navigate('/history');
    }, 1200);
  };

  const handleDeleteExpense = async () => {
    if (!id) return;
    await deleteExpense(id);
    navigate('/history');
  };

  const selectedCat = categories.find(c => c.id === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-bounce">🤖</div>
      </div>
    );
  }

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
        <span className="text-text-muted text-sm">Edit Expense</span>
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 rounded-full hover:bg-danger/20 transition-colors"
        >
          <Trash2 className="w-5 h-5 text-danger" />
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
          className="text-5xl md:text-7xl font-bold font-display text-text-primary mb-8"
        >
          {displayAmount}
        </motion.div>

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
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.95, backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
              onClick={() => num !== '.' && handleNumberPress(num)}
              disabled={num === '.'}
              className="h-16 rounded-2xl bg-surface text-text-primary text-2xl font-semibold hover:bg-surface-raised transition-colors disabled:opacity-30"
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-surface text-text-secondary hover:bg-surface-raised transition-colors flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={!isValid || !hasChanges}
          className={`w-full max-w-sm mx-auto h-14 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            isValid && hasChanges
              ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/30' 
              : 'bg-surface text-text-muted cursor-not-allowed'
          }`}
          animate={isValid && hasChanges ? { 
            boxShadow: ['0 10px 30px -10px rgba(99, 102, 241, 0.3)', '0 10px 30px -10px rgba(99, 102, 241, 0.6)', '0 10px 30px -10px rgba(99, 102, 241, 0.3)']
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Check className="w-5 h-5" />
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </motion.button>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-3xl p-8 max-w-sm w-full text-center"
            >
              <div className="text-6xl mb-4">🗑️</div>
              <h2 className="text-xl font-bold font-heading text-text-primary mb-2">
                Delete this expense?
              </h2>
              <p className="text-text-secondary mb-6">
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-12 bg-surface-raised text-text-primary rounded-xl font-medium hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteExpense}
                  className="flex-1 h-12 bg-danger text-white rounded-xl font-medium hover:bg-danger/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
