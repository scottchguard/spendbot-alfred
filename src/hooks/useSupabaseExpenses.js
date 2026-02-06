import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getLocalMonthString } from '../utils/dateUtils';

export function useSupabaseExpenses() {
  const { user, isPremium } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch expenses from Supabase
  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform to match existing format (cents to dollars handled in UI)
      setExpenses(data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchExpenses();

    if (!user) return;

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('expenses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setExpenses(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setExpenses(prev => prev.filter(e => e.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setExpenses(prev => prev.map(e => 
              e.id === payload.new.id ? payload.new : e
            ));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchExpenses]);

  // Add expense with timeout to prevent hanging on stale sessions
  const addExpense = async ({ amount, categoryId, note, date }) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check free tier limit
    const month = getLocalMonthString();
    const monthExpenses = expenses.filter(e => 
      e.date?.startsWith(month)
    );

    if (!isPremium && monthExpenses.length >= 50) {
      return { error: 'limit_reached', limitReached: true };
    }

    // Create a timeout promise to prevent hanging on stale sessions
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Save timed out - please try again')), 10000)
    );

    try {
      const { data, error } = await Promise.race([
        supabase
          .from('expenses')
          .insert({
            user_id: user.id,
            amount, // in cents
            category_id: categoryId,
            note: note || null,
            date: date || new Date().toISOString(),
          })
          .select()
          .single(),
        timeoutPromise
      ]);

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      console.error('Error adding expense:', err);
      return { error: err.message };
    }
  };

  // Delete expense with timeout
  const deleteExpense = async (id) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Delete timed out - please try again')), 10000)
    );

    try {
      const { error } = await Promise.race([
        supabase
          .from('expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id),
        timeoutPromise
      ]);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      console.error('Error deleting expense:', err);
      return { error: err.message };
    }
  };

  // Update expense with timeout
  const updateExpense = async (id, updates) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Update timed out - please try again')), 10000)
    );

    try {
      const { data, error } = await Promise.race([
        supabase
          .from('expenses')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single(),
        timeoutPromise
      ]);

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      console.error('Error updating expense:', err);
      return { error: err.message };
    }
  };

  // Clear all expenses
  const clearAllExpenses = async () => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setExpenses([]);
      return { error: null };
    } catch (err) {
      console.error('Error clearing expenses:', err);
      return { error: err.message };
    }
  };

  // Get expenses for export
  const getExpensesForExport = () => {
    return expenses;
  };

  // Computed values
  const currentMonth = getLocalMonthString();
  const monthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthCount = monthExpenses.length;
  const canAddExpense = isPremium || monthCount < 50;

  return {
    expenses,
    loading,
    error,
    addExpense,
    deleteExpense,
    updateExpense,
    clearAllExpenses,
    getExpensesForExport,
    monthTotal,
    monthCount,
    canAddExpense,
    refetch: fetchExpenses,
  };
}
