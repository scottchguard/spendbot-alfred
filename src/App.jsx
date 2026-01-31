import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';
import { Paywall } from './components/Paywall';
import { useExpenses } from './hooks/useExpenses';
import { initializeDB } from './db';

function App() {
  const [view, setView] = useState('dashboard'); // dashboard | history | settings
  const [showAdd, setShowAdd] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
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
    updateSettings,
    streakInfo,
    getAllExpenses,
    clearAllData
  } = useExpenses();

  useEffect(() => {
    initializeDB().then(() => setInitialized(true));
  }, []);

  const handleOnboardingComplete = async () => {
    await updateSettings({ onboardingComplete: true });
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-pulse">🤖</div>
      </div>
    );
  }

  // Show onboarding for new users
  if (!settings?.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const handleAddClick = () => {
    if (!canAddExpense) {
      setShowPaywall(true);
    } else {
      setShowAdd(true);
    }
  };

  const handleSave = async (amount, categoryId) => {
    return addExpense(amount, categoryId);
  };

  const handleUpgrade = () => {
    // In a real app, this would open Stripe/IAP
    // For now, just toggle premium for testing
    updateSettings({ isPremium: true });
    setShowPaywall(false);
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
            streakInfo={streakInfo}
            onAddClick={handleAddClick}
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
            categories={categories}
            onUpdate={updateSettings}
            onExport={getAllExpenses}
            onClearAll={clearAllData}
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
      
      <AnimatePresence>
        {showPaywall && (
          <Paywall
            monthCount={monthCount}
            onUpgrade={handleUpgrade}
            onClose={() => setShowPaywall(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
