import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { formatCurrency, formatTime, groupExpensesByDate } from '../utils/format';
import { Toast } from './Toast';

function SwipeableExpense({ expense, category, onDelete }) {
  const x = useMotionValue(0);
  const background = useTransform(x, [-100, 0], ['#EF4444', '#141419']);
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  
  const handleDragEnd = (_, info) => {
    if (info.offset.x < -100) {
      animate(x, -300, { duration: 0.2 });
      setTimeout(() => onDelete(expense.id), 200);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  return (
    <motion.div className="relative overflow-hidden rounded-xl mb-2">
      {/* Delete background */}
      <motion.div 
        style={{ backgroundColor: background }}
        className="absolute inset-0 flex items-center justify-end pr-6"
      >
        <motion.span style={{ opacity: deleteOpacity }} className="text-white font-medium">
          Delete
        </motion.span>
      </motion.div>
      
      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative bg-surface-raised p-4 flex items-center justify-between cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category?.emoji || '📦'}</span>
          <div>
            <div className="text-text-primary font-medium">
              {category?.name || 'Other'}
            </div>
            <div className="text-xs text-text-muted">
              {formatTime(expense.date)}
            </div>
          </div>
        </div>
        <div className="text-text-primary font-semibold">
          -{formatCurrency(expense.amount)}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function History({ expenses, categories, onDelete, onBack }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const deleteTimerRef = useRef(null);
  
  // Filter out pending delete from display
  const visibleExpenses = pendingDelete 
    ? expenses.filter(e => e.id !== pendingDelete.id)
    : expenses;
  const grouped = groupExpensesByDate(visibleExpenses);
  
  const handleDelete = (expenseId) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;
    
    // Store for potential undo
    setPendingDelete(expense);
    
    // Set timer to actually delete
    deleteTimerRef.current = setTimeout(() => {
      onDelete(expenseId);
      setPendingDelete(null);
    }, 4000);
  };
  
  const handleUndo = () => {
    // Cancel the delete
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }
    setPendingDelete(null);
  };
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between border-b border-border">
        <button onClick={onBack} className="text-accent text-lg">
          ← Back
        </button>
        <h1 className="text-lg font-heading font-semibold text-text-primary">
          History
        </h1>
        <div className="w-16" />
      </div>

      <div className="px-6 py-4">
        {grouped.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-text-secondary">No expenses yet!</p>
            <p className="text-text-muted text-sm mt-1">
              Start tracking to see your history here.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {grouped.map((group, groupIndex) => (
              <motion.div
                key={group.dateLabel}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
                className="mb-6"
              >
                {/* Date header */}
                <div className="flex items-center justify-between mb-3 sticky top-16 bg-background py-2">
                  <span className="text-sm font-semibold text-text-secondary">
                    {group.dateLabel}
                  </span>
                  <span className="text-sm text-text-muted">
                    {formatCurrency(group.total)}
                  </span>
                </div>

                {/* Expenses */}
                {group.expenses.map((expense, i) => (
                  <SwipeableExpense
                    key={expense.id}
                    expense={expense}
                    category={categories.find(c => c.id === expense.categoryId)}
                    onDelete={handleDelete}
                  />
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      
      {/* Undo Toast */}
      <Toast
        show={!!pendingDelete}
        message="Expense deleted"
        action="Undo"
        onAction={handleUndo}
      />
    </div>
  );
}
