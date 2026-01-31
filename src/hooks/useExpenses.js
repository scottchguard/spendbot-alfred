import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getMonthExpenses, getMonthExpenseCount, addExpense, deleteExpense, updateSettings } from '../db';

export function useExpenses() {
  const [loading, setLoading] = useState(true);

  const expenses = useLiveQuery(() => getMonthExpenses(), []);
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), []);
  const settings = useLiveQuery(() => db.settings.get('settings'), []);
  const monthCount = useLiveQuery(() => getMonthExpenseCount(), []);

  useEffect(() => {
    if (expenses !== undefined && categories !== undefined && settings !== undefined) {
      setLoading(false);
    }
  }, [expenses, categories, settings]);

  const monthTotal = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  const categoryTotals = expenses?.reduce((acc, expense) => {
    acc[expense.categoryId] = (acc[expense.categoryId] || 0) + expense.amount;
    return acc;
  }, {}) || {};

  const canAddExpense = settings?.isPremium || (monthCount || 0) < 50;

  return {
    loading,
    expenses: expenses || [],
    categories: categories || [],
    settings,
    monthTotal,
    monthCount: monthCount || 0,
    categoryTotals,
    canAddExpense,
    addExpense: async (amount, categoryId, note) => {
      if (!canAddExpense && !settings?.isPremium) {
        return { success: false, reason: 'limit' };
      }
      await addExpense(amount, categoryId, note);
      return { success: true };
    },
    deleteExpense,
    updateSettings
  };
}
