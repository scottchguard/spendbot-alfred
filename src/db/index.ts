import Dexie, { Table } from 'dexie';

// Types
export interface Expense {
  id: string;
  amount: number; // Cents (1250 = $12.50)
  categoryId: string;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isDefault: boolean;
  sortOrder: number;
}

export interface UserSettings {
  id: string;
  currency: string;
  monthlyBudget?: number;
  isPremium: boolean;
  purchaseDate?: Date;
  purchasePlatform?: 'web' | 'ios' | 'android';
  onboardingComplete: boolean;
  createdAt: Date;
}

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', emoji: '🍔', color: '#FB923C', isDefault: true, sortOrder: 0 },
  { id: 'transport', name: 'Transport', emoji: '🚗', color: '#60A5FA', isDefault: true, sortOrder: 1 },
  { id: 'groceries', name: 'Groceries', emoji: '🛒', color: '#34D399', isDefault: true, sortOrder: 2 },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬', color: '#C084FC', isDefault: true, sortOrder: 3 },
  { id: 'bills', name: 'Bills', emoji: '🏠', color: '#94A3B8', isDefault: true, sortOrder: 4 },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#F472B6', isDefault: true, sortOrder: 5 },
  { id: 'health', name: 'Health', emoji: '💊', color: '#F87171', isDefault: true, sortOrder: 6 },
  { id: 'travel', name: 'Travel', emoji: '✈️', color: '#22D3EE', isDefault: true, sortOrder: 7 },
  { id: 'subscriptions', name: 'Subscriptions', emoji: '📱', color: '#A78BFA', isDefault: true, sortOrder: 8 },
  { id: 'coffee', name: 'Coffee', emoji: '☕', color: '#FBBF24', isDefault: true, sortOrder: 9 },
  { id: 'other', name: 'Other', emoji: '📦', color: '#9CA3AF', isDefault: true, sortOrder: 10 },
];

class SpendBotDB extends Dexie {
  expenses!: Table<Expense>;
  categories!: Table<Category>;
  settings!: Table<UserSettings>;

  constructor() {
    super('SpendBotDB');
    this.version(1).stores({
      expenses: 'id, date, categoryId, createdAt',
      categories: 'id, isDefault, sortOrder',
      settings: 'id',
    });
  }
}

export const db = new SpendBotDB();

// Initialize default data
export async function initializeDB() {
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }

  const settings = await db.settings.get('settings');
  if (!settings) {
    await db.settings.add({
      id: 'settings',
      currency: 'USD',
      isPremium: false,
      onboardingComplete: false,
      createdAt: new Date(),
    });
  }
}

// Helper functions
export async function addExpense(amount: number, categoryId: string, note?: string): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date();
  await db.expenses.add({
    id,
    amount,
    categoryId,
    note,
    date: now,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function deleteExpense(id: string): Promise<void> {
  await db.expenses.delete(id);
}

export async function updateExpense(
  id: string,
  updates: { amount?: number; categoryId?: string; note?: string }
): Promise<void> {
  await db.expenses.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function getExpenseById(id: string): Promise<Expense | undefined> {
  return await db.expenses.get(id);
}

export async function getMonthlyTotal(year: number, month: number): Promise<number> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  
  const expenses = await db.expenses
    .where('date')
    .between(startDate, endDate)
    .toArray();
  
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
}

export async function getMonthlyExpenseCount(year: number, month: number): Promise<number> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  
  return await db.expenses
    .where('date')
    .between(startDate, endDate)
    .count();
}

export async function getExpensesByCategory(year: number, month: number): Promise<Record<string, number>> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);
  
  const expenses = await db.expenses
    .where('date')
    .between(startDate, endDate)
    .toArray();
  
  const byCategory: Record<string, number> = {};
  expenses.forEach(exp => {
    byCategory[exp.categoryId] = (byCategory[exp.categoryId] || 0) + exp.amount;
  });
  
  return byCategory;
}

export async function getTodayStats(): Promise<{ total: number; count: number }> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const expenses = await db.expenses
    .where('date')
    .between(startOfDay, endOfDay)
    .toArray();

  return {
    total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    count: expenses.length,
  };
}

export async function getWeekStats(): Promise<{ total: number; count: number }> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const expenses = await db.expenses
    .where('date')
    .between(startOfWeek, endOfWeek)
    .toArray();

  return {
    total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    count: expenses.length,
  };
}

export async function getRecentExpenses(limit: number = 5): Promise<Expense[]> {
  return await db.expenses
    .orderBy('date')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getAllExpenses(): Promise<Expense[]> {
  return await db.expenses
    .orderBy('date')
    .reverse()
    .toArray();
}

export async function getSettings(): Promise<UserSettings | undefined> {
  return await db.settings.get('settings');
}

export async function updateSettings(updates: Partial<UserSettings>): Promise<void> {
  await db.settings.update('settings', updates);
}

export async function getCategories(): Promise<Category[]> {
  return await db.categories.orderBy('sortOrder').toArray();
}

// Category management functions
export async function addCategory(
  name: string,
  emoji: string,
  color: string
): Promise<string> {
  const id = crypto.randomUUID();
  const categories = await getCategories();
  const maxSortOrder = categories.reduce((max, cat) => Math.max(max, cat.sortOrder), -1);
  
  await db.categories.add({
    id,
    name,
    emoji,
    color,
    isDefault: false,
    sortOrder: maxSortOrder + 1,
  });
  return id;
}

export async function updateCategory(
  id: string,
  updates: { name?: string; emoji?: string; color?: string }
): Promise<void> {
  await db.categories.update(id, updates);
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id);
}

export async function getCategoryExpenseCount(categoryId: string): Promise<number> {
  return await db.expenses
    .where('categoryId')
    .equals(categoryId)
    .count();
}

export async function getStreak(): Promise<number> {
  const now = new Date();
  let streak = 0;
  let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  while (true) {
    const startOfDay = new Date(checkDate);
    const endOfDay = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate(), 23, 59, 59);
    const count = await db.expenses
      .where('date')
      .between(startOfDay, endOfDay)
      .count();

    if (count > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export async function reassignExpenses(fromCategoryId: string, toCategoryId: string): Promise<void> {
  await db.expenses
    .where('categoryId')
    .equals(fromCategoryId)
    .modify({ categoryId: toCategoryId });
}
