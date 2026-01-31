import Dexie from 'dexie';

export const db = new Dexie('SpendBotDB');

db.version(1).stores({
  expenses: '++id, date, categoryId, createdAt',
  categories: 'id, isDefault, sortOrder',
  settings: 'id'
});

// Default categories
export const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food', emoji: '🍔', color: '#F97316', isDefault: true, sortOrder: 0 },
  { id: 'transport', name: 'Transport', emoji: '🚗', color: '#3B82F6', isDefault: true, sortOrder: 1 },
  { id: 'groceries', name: 'Groceries', emoji: '🛒', color: '#22C55E', isDefault: true, sortOrder: 2 },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬', color: '#A855F7', isDefault: true, sortOrder: 3 },
  { id: 'bills', name: 'Bills', emoji: '🏠', color: '#6B7280', isDefault: true, sortOrder: 4 },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#EC4899', isDefault: true, sortOrder: 5 },
  { id: 'health', name: 'Health', emoji: '💊', color: '#EF4444', isDefault: true, sortOrder: 6 },
  { id: 'travel', name: 'Travel', emoji: '✈️', color: '#06B6D4', isDefault: true, sortOrder: 7 },
  { id: 'subscriptions', name: 'Subscriptions', emoji: '📱', color: '#6366F1', isDefault: true, sortOrder: 8 },
  { id: 'other', name: 'Other', emoji: '📦', color: '#64748B', isDefault: true, sortOrder: 9 },
];

// Initialize defaults on first run
export async function initializeDB() {
  const settings = await db.settings.get('settings');
  if (!settings) {
    await db.settings.put({
      id: 'settings',
      currency: 'USD',
      monthlyBudget: null,
      isPremium: false,
      onboardingComplete: false,
      createdAt: new Date()
    });
  }

  const categories = await db.categories.count();
  if (categories === 0) {
    await db.categories.bulkPut(DEFAULT_CATEGORIES);
  }
}

// Helper to get current month's expenses
export async function getMonthExpenses(date = new Date()) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  
  return db.expenses
    .where('date')
    .between(startOfMonth, endOfMonth)
    .reverse()
    .sortBy('date');
}

// Get expenses count for current month
export async function getMonthExpenseCount(date = new Date()) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  
  return db.expenses
    .where('date')
    .between(startOfMonth, endOfMonth)
    .count();
}

// Add expense
export async function addExpense(amount, categoryId, note = '') {
  const now = new Date();
  return db.expenses.add({
    amount, // in cents
    categoryId,
    note,
    date: now,
    createdAt: now,
    updatedAt: now
  });
}

// Delete expense
export async function deleteExpense(id) {
  return db.expenses.delete(id);
}

// Update settings
export async function updateSettings(updates) {
  return db.settings.update('settings', {
    ...updates,
    updatedAt: new Date()
  });
}
