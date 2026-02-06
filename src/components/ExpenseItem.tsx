import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Expense, Category } from '../db';

interface ExpenseItemProps {
  expense: Expense;
  category?: Category;
  formatCurrency: (cents: number) => string;
}

export default function ExpenseItem({ expense, category, formatCurrency }: ExpenseItemProps) {
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    const now = new Date();
    const expDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return expDate.toLocaleDateString('en-US', { weekday: 'long' });
    return expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.button
      onClick={() => navigate(`/edit/${expense.id}`)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-between p-4 bg-surface rounded-xl hover:bg-surface-raised transition-colors"
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ backgroundColor: category?.color + '20' }}
        >
          {category?.emoji || '📦'}
        </div>
        <div className="text-left">
          <div className="text-text-primary font-medium">{category?.name || 'Other'}</div>
          <div className="text-text-muted text-sm">{formatDate(expense.date)}</div>
        </div>
      </div>
      <div className="text-text-primary font-semibold">
        {formatCurrency(expense.amount)}
      </div>
    </motion.button>
  );
}
