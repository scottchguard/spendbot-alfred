import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, AlertTriangle, ChevronRight } from 'lucide-react';
import {
  getCategories,
  getSettings,
  updateSettings,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoryExpenseCount,
  reassignExpenses,
  getExpensesByCategory,
  getAllExpenses,
  Category,
  UserSettings,
} from '../db';

const EMOJI_OPTIONS = ['🍔', '🚗', '🛒', '🎬', '🏠', '🛍️', '💊', '✈️', '📱', '📦', '💰', '🎮', '☕', '🍕', '🏋️', '🎵', '📚', '🐕', '💇', '🔧'];
const COLOR_OPTIONS = ['#FB923C', '#60A5FA', '#34D399', '#C084FC', '#94A3B8', '#F472B6', '#F87171', '#22D3EE', '#A78BFA', '#9CA3AF', '#FBBF24', '#10B981'];

interface EditingCategory {
  id: string | null;
  name: string;
  emoji: string;
  color: string;
}

// Reusable SettingsRow per spec
function SettingsRow({
  icon,
  label,
  value,
  meta,
  destructive,
  onClick,
}: {
  icon: string;
  label: string;
  value?: string;
  meta?: string;
  destructive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center p-4 border-b border-surface-elevated last:border-b-0 active:bg-surface-elevated transition-colors text-left ${
        destructive ? '' : ''
      }`}
    >
      <div className="w-8 h-8 flex items-center justify-center bg-surface rounded-lg text-base mr-3 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-base ${destructive ? 'text-danger' : 'text-text-primary'}`}>
          {label}
        </div>
        {value && <div className="text-sm text-text-secondary mt-0.5">{value}</div>}
      </div>
      {meta && <span className="text-sm text-text-muted ml-2">{meta}</span>}
      {onClick && (
        <ChevronRight className="w-4 h-4 text-text-muted ml-1 flex-shrink-0" />
      )}
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [categorySpend, setCategorySpend] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Budget state
  const [budget, setBudget] = useState('');
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  // Category editing state
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Delete confirmation
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteExpenseCount, setDeleteExpenseCount] = useState(0);
  const [reassignTarget, setReassignTarget] = useState('');

  // Clear data confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Is PWA installed
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const now = new Date();
    const [cats, userSettings, spend] = await Promise.all([
      getCategories(),
      getSettings(),
      getExpensesByCategory(now.getFullYear(), now.getMonth()),
    ]);
    setCategories(cats);
    setSettings(userSettings || null);
    setCategorySpend(spend);
    if (userSettings?.monthlyBudget) {
      setBudget((userSettings.monthlyBudget / 100).toString());
    }
    setIsLoading(false);
  }

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings?.currency || 'USD',
    }).format(cents / 100);

  const handleBudgetSave = async () => {
    const value = parseFloat(budget);
    if (!isNaN(value) && value > 0) {
      await updateSettings({ monthlyBudget: Math.round(value * 100) });
      setSettings((prev) => (prev ? { ...prev, monthlyBudget: Math.round(value * 100) } : null));
    } else if (budget === '' || budget === '0') {
      await updateSettings({ monthlyBudget: undefined });
      setSettings((prev) => (prev ? { ...prev, monthlyBudget: undefined } : null));
    }
    setShowBudgetInput(false);
  };

  const startAddCategory = () =>
    setEditingCategory({ id: null, name: '', emoji: '📦', color: '#6B7280' });

  const startEditCategory = (cat: Category) =>
    setEditingCategory({ id: cat.id, name: cat.name, emoji: cat.emoji, color: cat.color });

  const cancelEditing = () => {
    setEditingCategory(null);
    setShowEmojiPicker(false);
    setShowColorPicker(false);
  };

  const saveCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    if (editingCategory.id) {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        emoji: editingCategory.emoji,
        color: editingCategory.color,
      });
    } else {
      await addCategory(editingCategory.name.trim(), editingCategory.emoji, editingCategory.color);
    }
    cancelEditing();
    await loadData();
  };

  const startDeleteCategory = async (cat: Category) => {
    const count = await getCategoryExpenseCount(cat.id);
    setDeleteExpenseCount(count);
    setDeletingCategory(cat);
    const otherCat = categories.find((c) => c.id === 'other');
    setReassignTarget(otherCat?.id || categories[0]?.id || '');
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    if (deleteExpenseCount > 0 && reassignTarget) {
      await reassignExpenses(deletingCategory.id, reassignTarget);
    }
    await deleteCategory(deletingCategory.id);
    setDeletingCategory(null);
    setDeleteExpenseCount(0);
    await loadData();
  };

  const handleExportCSV = async () => {
    const expenses = await getAllExpenses();
    const cats = await getCategories();
    const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));

    const header = 'Date,Category,Amount,Note\n';
    const rows = expenses
      .map((e) => {
        const date = new Date(e.date).toISOString().split('T')[0];
        const cat = catMap[e.categoryId] || 'Unknown';
        const amount = (e.amount / 100).toFixed(2);
        const note = (e.note || '').replace(/"/g, '""');
        return `${date},"${cat}",${amount},"${note}"`;
      })
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendbot-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    const { db } = await import('../db');
    await db.expenses.clear();
    setShowClearConfirm(false);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-bounce">🤖</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))' }}>
      {/* Header — left-aligned per spec */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center p-4"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl"
        >
          <ArrowLeft className="w-6 h-6 text-text-secondary" />
        </button>
        <h1 className="text-xl font-semibold font-heading text-text-primary ml-3">Settings</h1>
      </motion.header>

      {/* ACCOUNT */}
      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted px-4 mb-2">
          Account
        </div>
        <div className="bg-surface-raised mx-4 rounded-2xl overflow-hidden">
          <SettingsRow icon="📧" label="Email" value="Local account" />
          <SettingsRow icon="🔐" label="Password" onClick={() => {}} />
          <SettingsRow icon="🚪" label="Sign Out" onClick={() => {}} />
        </div>
      </section>

      {/* BUDGET */}
      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted px-4 mb-2">
          Budget
        </div>
        <div className="bg-surface-raised mx-4 rounded-2xl overflow-hidden">
          {showBudgetInput ? (
            <div className="flex items-center p-4 gap-2">
              <div className="w-8 h-8 flex items-center justify-center bg-surface rounded-lg text-base flex-shrink-0">
                💰
              </div>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-right focus:outline-none focus:border-accent"
                autoFocus
              />
              <button onClick={handleBudgetSave} className="p-2 bg-accent rounded-lg text-white">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setShowBudgetInput(false)} className="p-2 bg-surface rounded-lg text-text-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <SettingsRow
              icon="💰"
              label="Monthly Budget"
              value={settings?.monthlyBudget ? formatCurrency(settings.monthlyBudget) : 'Not set'}
              onClick={() => setShowBudgetInput(true)}
            />
          )}
          <SettingsRow icon="📅" label="Budget Start Day" value="1st of month" onClick={() => {}} />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted px-4 mb-2">
          Categories
        </div>
        <div className="bg-surface-raised mx-4 rounded-2xl overflow-hidden">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center p-4 border-b border-surface-elevated last:border-b-0"
            >
              <div
                className="w-8 h-8 flex items-center justify-center rounded-lg text-base mr-3 flex-shrink-0"
                style={{ backgroundColor: cat.color + '20' }}
              >
                {cat.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base text-text-primary">{cat.name}</div>
              </div>
              {categorySpend[cat.id] && (
                <span className="text-sm text-text-muted mr-2">
                  {formatCurrency(categorySpend[cat.id])}
                </span>
              )}
              <button onClick={() => startEditCategory(cat)} className="p-2 rounded-lg hover:bg-surface transition-colors">
                <Pencil className="w-4 h-4 text-text-secondary" />
              </button>
              {!cat.isDefault && (
                <button onClick={() => startDeleteCategory(cat)} className="p-2 rounded-lg hover:bg-danger/20 transition-colors">
                  <Trash2 className="w-4 h-4 text-danger" />
                </button>
              )}
            </div>
          ))}
          <SettingsRow icon="➕" label="Add Category" onClick={startAddCategory} />
        </div>
      </section>

      {/* DATA */}
      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted px-4 mb-2">
          Data
        </div>
        <div className="bg-surface-raised mx-4 rounded-2xl overflow-hidden">
          <SettingsRow icon="📤" label="Export to CSV" onClick={handleExportCSV} />
          <SettingsRow icon="🗑️" label="Clear All Data" destructive onClick={() => setShowClearConfirm(true)} />
        </div>
      </section>

      {/* SUPPORT */}
      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted px-4 mb-2">
          Support
        </div>
        <div className="bg-surface-raised mx-4 rounded-2xl overflow-hidden">
          <SettingsRow icon="❓" label="Help & FAQ" onClick={() => {}} />
          <SettingsRow icon="💬" label="Contact Support" onClick={() => window.open('mailto:support@loopspur.com')} />
          <SettingsRow icon="⭐" label="Rate SpendBot" onClick={() => {}} />
          {isInstalled ? (
            <div className="flex items-center p-4 border-b border-surface-elevated last:border-b-0">
              <div className="w-8 h-8 flex items-center justify-center bg-surface rounded-lg text-base mr-3">✅</div>
              <div>
                <div className="text-base text-success">App Installed</div>
                <div className="text-sm text-text-secondary mt-0.5">You're using the full experience</div>
              </div>
            </div>
          ) : (
            <SettingsRow icon="📲" label="Install App" value="Get the full app experience" onClick={() => {}} />
          )}
        </div>
      </section>

      {/* Premium CTA */}
      {!settings?.isPremium && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="mx-4 w-[calc(100%-2rem)] p-4 rounded-2xl text-center mb-6"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}
          onClick={() => {}}
        >
          <span className="text-base font-semibold text-white">✨ Upgrade to Premium</span>
        </motion.button>
      )}

      {/* Footer */}
      <footer className="text-center px-4 py-6">
        <div className="flex items-center justify-center gap-2 text-text-secondary text-sm mb-3">
          🤖 SpendBot v1.1.0 • Made by Loopspur
        </div>
        <div className="flex justify-center gap-4">
          <a href="#" className="text-sm text-text-muted">Privacy</a>
          <a href="#" className="text-sm text-text-muted">Terms</a>
          <a href="#" className="text-sm text-text-muted">Licenses</a>
        </div>
      </footer>

      {/* Category Edit Modal */}
      <AnimatePresence>
        {editingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-end justify-center z-50"
            onClick={cancelEditing}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-t-3xl p-6 w-full max-w-lg"
            >
              <h2 className="text-xl font-bold font-heading text-text-primary mb-6">
                {editingCategory.id ? 'Edit Category' : 'New Category'}
              </h2>

              <div className="flex items-center gap-3 mb-6 p-4 bg-background rounded-xl">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: editingCategory.color + '20' }}
                >
                  {editingCategory.emoji}
                </div>
                <div className="text-text-primary font-medium text-lg">
                  {editingCategory.name || 'Category Name'}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="Category name"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">Emoji</label>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-left text-2xl"
                >
                  {editingCategory.emoji}
                </button>
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 grid grid-cols-10 gap-2 p-3 bg-background rounded-xl"
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setEditingCategory({ ...editingCategory, emoji });
                            setShowEmojiPicker(false);
                          }}
                          className={`text-2xl p-2 rounded-lg hover:bg-surface-raised transition-colors ${
                            editingCategory.emoji === emoji ? 'bg-accent/20 ring-2 ring-accent' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-text-secondary mb-2">Color</label>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: editingCategory.color }} />
                  <span className="text-text-secondary">{editingCategory.color}</span>
                </button>
                <AnimatePresence>
                  {showColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 grid grid-cols-6 gap-2 p-3 bg-background rounded-xl"
                    >
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setEditingCategory({ ...editingCategory, color });
                            setShowColorPicker(false);
                          }}
                          className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                            editingCategory.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelEditing}
                  className="flex-1 h-12 bg-background text-text-secondary rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCategory}
                  disabled={!editingCategory.name.trim()}
                  className="flex-1 h-12 bg-accent text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {editingCategory.id ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
            onClick={() => { setDeletingCategory(null); setDeleteExpenseCount(0); setReassignTarget(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-3xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <h2 className="text-lg font-bold font-heading text-text-primary">
                  Delete "{deletingCategory.name}"?
                </h2>
              </div>

              {deleteExpenseCount > 0 ? (
                <div className="mb-6">
                  <p className="text-text-secondary mb-4">
                    This category has{' '}
                    <span className="font-semibold text-text-primary">
                      {deleteExpenseCount} expense{deleteExpenseCount !== 1 ? 's' : ''}
                    </span>
                    . Choose a category to reassign them to:
                  </p>
                  <select
                    value={reassignTarget}
                    onChange={(e) => setReassignTarget(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent"
                  >
                    {categories
                      .filter((c) => c.id !== deletingCategory.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <p className="text-text-secondary mb-6">
                  This category has no expenses. It will be permanently deleted.
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setDeletingCategory(null); setDeleteExpenseCount(0); setReassignTarget(''); }}
                  className="flex-1 h-12 bg-background text-text-secondary rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button onClick={confirmDelete} className="flex-1 h-12 bg-danger text-white rounded-xl font-medium">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Data Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-3xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <h2 className="text-lg font-bold font-heading text-text-primary">Clear All Data?</h2>
              </div>
              <p className="text-text-secondary mb-6">
                This will permanently delete all your expenses. Categories and settings will remain. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 h-12 bg-background text-text-secondary rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button onClick={handleClearData} className="flex-1 h-12 bg-danger text-white rounded-xl font-medium">
                  Clear Data
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
