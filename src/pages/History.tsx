import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowLeft, Search, Trash2, Pencil } from 'lucide-react';
import { getAllExpenses, getCategories, deleteExpense, Expense, Category, getSettings } from '../db';

interface GroupedExpenses {
  date: string;
  dateLabel: string;
  total: number;
  expenses: Expense[];
}

export default function History() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const dragStartX = useRef<number>(0);
  const wasDragging = useRef<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [allExpenses, cats, settings] = await Promise.all([
      getAllExpenses(),
      getCategories(),
      getSettings(),
    ]);
    setExpenses(allExpenses);
    setCategories(cats);
    setCurrency(settings?.currency || 'USD');
    setIsLoading(false);
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Group expenses by date
  const groupedExpenses: GroupedExpenses[] = expenses.reduce((groups, expense) => {
    const date = new Date(expense.date).toDateString();
    const existing = groups.find(g => g.date === date);
    
    if (existing) {
      existing.expenses.push(expense);
      existing.total += expense.amount;
    } else {
      const expenseDate = new Date(expense.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateLabel: string;
      if (expenseDate.toDateString() === today.toDateString()) {
        dateLabel = 'Today';
      } else if (expenseDate.toDateString() === yesterday.toDateString()) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = expenseDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      groups.push({
        date,
        dateLabel,
        total: expense.amount,
        expenses: [expense],
      });
    }
    
    return groups;
  }, [] as GroupedExpenses[]);

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    setDeleteId(null);
  };

  const handleDragStart = () => {
    wasDragging.current = false;
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 10) {
      wasDragging.current = true;
    }
  };

  const handleDragEnd = (id: string, info: PanInfo) => {
    if (info.offset.x < -100) {
      setDeleteId(id);
    }
  };

  const handleExpenseClick = (id: string) => {
    // Only navigate if not dragging
    if (!wasDragging.current) {
      navigate(`/edit/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-bounce">🤖</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="sticky top-0 bg-background/80 backdrop-blur-lg z-10 flex items-center justify-between p-4 border-b border-border"
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-full hover:bg-surface transition-colors">
            <ArrowLeft className="w-6 h-6 text-text-secondary" />
          </Link>
          <h1 className="text-xl font-semibold text-text-primary font-heading">History</h1>
        </div>
        <button className="p-2 rounded-full hover:bg-surface transition-colors">
          <Search className="w-6 h-6 text-text-secondary" />
        </button>
      </motion.header>

      {/* Content */}
      {expenses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 px-6"
        >
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-text-secondary mb-2">No expenses yet!</p>
          <p className="text-text-muted text-sm mb-6">Start tracking to see your history here.</p>
          <Link 
            to="/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition-colors"
          >
            Add Expense
          </Link>
        </motion.div>
      ) : (
        <div className="pb-8">
          {groupedExpenses.map((group, groupIndex) => (
            <div key={group.date}>
              {/* Date Header */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: groupIndex * 0.05 }}
                className="sticky top-[73px] bg-background/80 backdrop-blur-lg px-4 py-3 flex items-center justify-between border-b border-border"
              >
                <span className="text-text-primary font-medium">{group.dateLabel}</span>
                <span className="text-text-secondary">{formatCurrency(group.total)}</span>
              </motion.div>

              {/* Expenses */}
              <div className="px-4">
                <AnimatePresence>
                  {group.expenses.map((expense, index) => {
                    const category = categories.find(c => c.id === expense.categoryId);
                    const isDeleting = deleteId === expense.id;

                    return (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -200, height: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="relative overflow-hidden"
                      >
                        {/* Delete background */}
                        <div className="absolute inset-y-0 right-0 w-24 bg-danger flex items-center justify-end pr-4">
                          <Trash2 className="w-5 h-5 text-white" />
                        </div>

                        {/* Edit hint background (right side, shows on tap) */}
                        <div className="absolute inset-y-0 left-0 w-16 bg-accent/20 flex items-center pl-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <Pencil className="w-4 h-4 text-accent" />
                        </div>

                        {/* Swipeable expense card */}
                        <motion.div
                          drag="x"
                          dragConstraints={{ left: -100, right: 0 }}
                          dragElastic={0.1}
                          onDragStart={handleDragStart}
                          onDrag={handleDrag}
                          onDragEnd={(_, info) => handleDragEnd(expense.id, info)}
                          onClick={() => handleExpenseClick(expense.id)}
                          className="relative bg-background py-4 flex items-center gap-4 cursor-pointer active:bg-surface-raised/50 transition-colors"
                        >
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${category?.color}20` }}
                          >
                            {category?.emoji || '📦'}
                          </div>
                          <div className="flex-1">
                            <p className="text-text-primary font-medium">{category?.name || 'Other'}</p>
                            <p className="text-text-muted text-sm">{formatTime(expense.date)}</p>
                          </div>
                          <p className="text-text-primary font-semibold font-display">
                            {formatCurrency(expense.amount)}
                          </p>
                        </motion.div>

                        {/* Delete confirmation */}
                        <AnimatePresence>
                          {isDeleting && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-danger flex items-center justify-center gap-4"
                            >
                              <button
                                onClick={() => handleDelete(expense.id)}
                                className="px-4 py-2 bg-white text-danger rounded-lg font-medium"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium"
                              >
                                Cancel
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
