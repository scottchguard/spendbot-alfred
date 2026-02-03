import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { formatCurrency, formatTime, formatDate, groupExpensesByDate } from '../utils/format';
import { Toast } from './Toast';
import haptic from '../utils/haptics';
import playSound from '../utils/sounds';

// Date range options
const DATE_RANGES = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

// Get date range bounds
function getDateRange(rangeId, customDate = null) {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  switch (rangeId) {
    case 'today':
      return { start, end: now };
    
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      const yesterdayEnd = new Date(start);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { start, end: yesterdayEnd };
    
    case 'week':
      start.setDate(start.getDate() - start.getDay()); // Sunday
      return { start, end: now };
    
    case 'month':
      start.setDate(1);
      return { start, end: now };
    
    case 'custom':
      if (customDate) {
        const customStart = new Date(customDate);
        customStart.setHours(0, 0, 0, 0);
        const customEnd = new Date(customDate);
        customEnd.setHours(23, 59, 59, 999);
        return { start: customStart, end: customEnd };
      }
      return { start, end: now };
    
    default:
      return { start: new Date(0), end: now };
  }
}

// Format date for display in header
function formatDateHeader(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Calendar date picker
function DatePicker({ selectedDate, onSelect, onClose, expenses }) {
  const [viewMonth, setViewMonth] = useState(new Date());
  
  // Get days in month
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
  
  // Get expense dates for highlighting
  const expenseDates = useMemo(() => {
    const dates = new Set();
    (expenses || []).forEach(e => {
      dates.add(new Date(e.date).toDateString());
    });
    return dates;
  }, [expenses]);
  
  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  const handlePrevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };
  
  const handleSelectDay = (day) => {
    if (!day) return;
    const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    haptic('light');
    onSelect(date);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface rounded-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Month navigation */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button 
            onClick={handlePrevMonth}
            className="p-2 text-text-secondary hover:text-text-primary"
          >
            ←
          </button>
          <h3 className="font-semibold text-text-primary">
            {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={handleNextMonth}
            className="p-2 text-text-secondary hover:text-text-primary"
          >
            →
          </button>
        </div>
        
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 px-4 py-2 bg-surface-raised">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs text-text-muted font-medium py-1">
              {d}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 p-4">
          {days.map((day, i) => {
            if (!day) return <div key={i} />;
            
            const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
            const dateStr = date.toDateString();
            const hasExpenses = expenseDates.has(dateStr);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const isFuture = date > new Date();
            
            return (
              <button
                key={i}
                onClick={() => !isFuture && handleSelectDay(day)}
                disabled={isFuture}
                className={`
                  relative aspect-square flex items-center justify-center rounded-lg text-sm
                  transition-colors
                  ${isFuture 
                    ? 'text-text-muted/30 cursor-not-allowed' 
                    : 'hover:bg-surface-raised'}
                  ${isSelected 
                    ? 'bg-accent text-white' 
                    : isToday 
                      ? 'bg-accent/20 text-accent' 
                      : 'text-text-primary'}
                `}
              >
                {day}
                {hasExpenses && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-3 bg-surface-raised rounded-xl text-text-primary font-medium"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Category filter chips
function CategoryFilter({ categories, selected, onToggle }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onToggle(null)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-accent text-white'
            : 'bg-surface-raised text-text-secondary'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onToggle(cat.id)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            selected === cat.id
              ? 'bg-accent text-white'
              : 'bg-surface-raised text-text-secondary'
          }`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
}

// Summary stats for selected period
function PeriodSummary({ expenses, categories }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;
  const avgPerExpense = count > 0 ? total / count : 0;
  
  // Top category
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category_id] = (categoryTotals[e.category_id] || 0) + e.amount;
  });
  const topCategoryId = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCategory = categories.find(c => c.id === topCategoryId);
  
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="bg-surface-raised rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-text-primary">
          {formatCurrency(total)}
        </p>
        <p className="text-xs text-text-muted">Total</p>
      </div>
      <div className="bg-surface-raised rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-text-primary">
          {count}
        </p>
        <p className="text-xs text-text-muted">Transactions</p>
      </div>
      <div className="bg-surface-raised rounded-xl p-3 text-center">
        {topCategory ? (
          <>
            <p className="text-2xl">{topCategory.emoji}</p>
            <p className="text-xs text-text-muted">{topCategory.name}</p>
          </>
        ) : (
          <>
            <p className="text-2xl">—</p>
            <p className="text-xs text-text-muted">Top Category</p>
          </>
        )}
      </div>
    </div>
  );
}

// Swipeable expense item
function SwipeableExpense({ expense, category, onDelete }) {
  const x = useMotionValue(0);
  const background = useTransform(x, [-100, 0], ['#EF4444', '#141419']);
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  
  const handleDragEnd = (_, info) => {
    if (info.offset.x < -100) {
      haptic('delete');
      playSound('delete');
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

// Main History component
export function History({ expenses, categories, onDelete, onBack }) {
  const [dateRange, setDateRange] = useState('month');
  const [customDate, setCustomDate] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const deleteTimerRef = useRef(null);
  
  // Filter expenses
  const filteredExpenses = useMemo(() => {
    const { start, end } = getDateRange(dateRange, customDate);
    
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      
      // Date filter
      if (expenseDate < start || expenseDate > end) return false;
      
      // Category filter
      if (categoryFilter && e.category_id !== categoryFilter) return false;
      
      // Search filter (by amount)
      if (searchQuery) {
        const amountStr = (e.amount / 100).toFixed(2);
        const cat = categories.find(c => c.id === e.category_id);
        const catName = cat?.name?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        if (!amountStr.includes(query) && !catName.includes(query)) {
          return false;
        }
      }
      
      // Exclude pending delete
      if (pendingDelete && e.id === pendingDelete.id) return false;
      
      return true;
    });
  }, [expenses, dateRange, customDate, categoryFilter, searchQuery, pendingDelete]);
  
  const grouped = groupExpensesByDate(filteredExpenses);
  
  const handleDelete = (expenseId) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;
    
    setPendingDelete(expense);
    
    deleteTimerRef.current = setTimeout(() => {
      onDelete(expenseId);
      setPendingDelete(null);
    }, 4000);
  };
  
  const handleUndo = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }
    setPendingDelete(null);
  };
  
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  // Get display label for date range
  const dateRangeLabel = useMemo(() => {
    if (dateRange === 'custom' && customDate) {
      return formatDateHeader(customDate);
    }
    return DATE_RANGES.find(r => r.id === dateRange)?.label || 'All Time';
  }, [dateRange, customDate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border">
        <div className="px-6 py-4 flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="text-accent text-lg font-medium"
          >
            ← Back
          </button>
          <h1 className="text-lg font-heading font-semibold text-text-primary">
            History
          </h1>
          <button 
            onClick={() => setShowDatePicker(true)}
            className="text-accent text-sm font-medium"
          >
            📅
          </button>
        </div>
        
        {/* Date range tabs */}
        <div className="px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {DATE_RANGES.map(range => (
              <button
                key={range.id}
                onClick={() => {
                  if (range.id === 'custom') {
                    setShowDatePicker(true);
                  } else {
                    setDateRange(range.id);
                    setCustomDate(null);
                  }
                  haptic('light');
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  dateRange === range.id
                    ? 'bg-accent text-white'
                    : 'bg-surface-raised text-text-secondary hover:text-text-primary'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Search bar */}
        <div className="px-6 pb-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by amount or category..."
              className="w-full pl-12 pr-4 py-3 bg-surface-raised rounded-xl 
                       text-text-primary placeholder:text-text-muted
                       focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Category filters */}
        <div className="px-6 pb-4">
          <CategoryFilter
            categories={categories}
            selected={categoryFilter}
            onToggle={setCategoryFilter}
          />
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Period summary */}
        {filteredExpenses.length > 0 && (
          <PeriodSummary 
            expenses={filteredExpenses} 
            categories={categories} 
          />
        )}
        
        {/* Date range label */}
        {dateRange === 'custom' && customDate && (
          <div className="mb-4 text-center">
            <h2 className="text-lg font-semibold text-text-primary">
              {formatDateHeader(customDate)}
            </h2>
          </div>
        )}
        
        {/* Expense list */}
        {grouped.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-text-secondary">No expenses found</p>
            <p className="text-text-muted text-sm mt-1">
              {searchQuery 
                ? 'Try a different search term'
                : categoryFilter
                  ? 'No expenses in this category for the selected period'
                  : 'No expenses recorded for this time period'}
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
                <div className="flex items-center justify-between mb-3 py-2">
                  <span className="text-sm font-semibold text-text-secondary">
                    {group.dateLabel}
                  </span>
                  <span className="text-sm text-accent font-medium">
                    {formatCurrency(group.total)}
                  </span>
                </div>

                {/* Expenses */}
                {group.expenses.map((expense) => (
                  <SwipeableExpense
                    key={expense.id}
                    expense={expense}
                    category={categories.find(c => c.id === expense.category_id)}
                    onDelete={handleDelete}
                  />
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      
      {/* Date picker modal */}
      <AnimatePresence>
        {showDatePicker && (
          <DatePicker
            selectedDate={customDate}
            onSelect={(date) => {
              setCustomDate(date);
              setDateRange('custom');
              setShowDatePicker(false);
            }}
            onClose={() => setShowDatePicker(false)}
            expenses={expenses}
          />
        )}
      </AnimatePresence>
      
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
