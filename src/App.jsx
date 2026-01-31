import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { useExpenses } from './hooks/useExpenses';
import { initializeDB } from './db';

function App() {
  const [view, setView] = useState('dashboard'); // dashboard | history | settings
  const [showAdd, setShowAdd] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const {
    loading,
    expenses,
    categories,
    settings,
    monthTotal,
    monthCount,
    categoryTotals,
    canAddExpense,
    addExpense,
    deleteExpense,
    updateSettings
  } = useExpenses();

  useEffect(() => {
    initializeDB().then(() => setInitialized(true));
  }, []);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-pulse">🤖</div>
      </div>
    );
  }

  const handleSave = async (amount, categoryId) => {
    return addExpense(amount, categoryId);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <Dashboard
            key="dashboard"
            monthTotal={monthTotal}
            expenses={expenses}
            categories={categories}
            categoryTotals={categoryTotals}
            settings={settings}
            monthCount={monthCount}
            onAddClick={() => setShowAdd(true)}
            onHistoryClick={() => setView('history')}
            onSettingsClick={() => setView('settings')}
          />
        )}
        
        {view === 'history' && (
          <History
            key="history"
            expenses={expenses}
            categories={categories}
            onDelete={deleteExpense}
            onBack={() => setView('dashboard')}
          />
        )}
        
        {view === 'settings' && (
          <Settings
            key="settings"
            settings={settings}
            onUpdate={updateSettings}
            onBack={() => setView('dashboard')}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showAdd && (
          <AddExpense
            categories={categories}
            canAdd={canAddExpense}
            onSave={handleSave}
            onClose={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
