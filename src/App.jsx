import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { DashboardV2 as Dashboard } from './components/DashboardV2';
import { AddExpense } from './components/AddExpense';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { Onboarding } from './components/Onboarding';
import { Paywall } from './components/Paywall';
import { InstallBanner } from './components/InstallBanner';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { FunLoader } from './components/EasterEggs';
import { CalendarView } from './components/CalendarView';
import { usePWA } from './hooks/usePWA';
import { getLocalMonthString } from './utils/dateUtils';
import { useSupabaseExpenses } from './hooks/useSupabaseExpenses';
import { useSupabaseSettings } from './hooks/useSupabaseSettings';
import { DEFAULT_CATEGORIES } from './constants/categories';
import { initAudio } from './utils/sounds';

function AppContent() {
  const { user, profile, loading: authLoading, isPremium } = useAuth();
  const [view, setView] = useState('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const { canInstall, isIOS, install, isInstalled } = usePWA();
  
  const {
    expenses,
    loading: expensesLoading,
    monthTotal,
    monthCount,
    canAddExpense,
    addExpense,
    deleteExpense,
    getExpensesForExport,
    clearAllExpenses,
  } = useSupabaseExpenses();

  const {
    settings,
    loading: settingsLoading,
    updateSettings,
    updateStreak,
  } = useSupabaseSettings();

  // Initialize audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Check if user needs onboarding - only after settings have loaded
  useEffect(() => {
    // Don't check until settings have loaded
    if (settingsLoading) return;
    
    if (user && !settings?.onboardingComplete) {
      setShowOnboarding(true);
    } else {
      // Reset if user already completed onboarding
      setShowOnboarding(false);
    }
  }, [user, settings?.onboardingComplete, settingsLoading]);

  // Loading state - with fun messages!
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FunLoader message="Waking up the robot..." />
      </div>
    );
  }

  // Not authenticated - show landing page or auth screen
  if (!user) {
    if (showAuth) {
      return <AuthScreen onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // Still loading data - with rotating fun messages!
  if (expensesLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FunLoader />
      </div>
    );
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={async () => {
          try {
            await updateSettings({ onboardingComplete: true });
          } catch (error) {
            console.error('Failed to save onboarding status:', error);
            // Don't trap the user - they can proceed even if save fails
            // Settings will be created on next successful auth
          }
          setShowOnboarding(false);
        }} 
      />
    );
  }

  const handleAddClick = () => {
    if (!canAddExpense) {
      setShowPaywall(true);
    } else {
      setShowAdd(true);
    }
  };

  const handleSave = async (amount, categoryId) => {
    const result = await addExpense({ amount, categoryId });
    if (result.limitReached) {
      setShowPaywall(true);
    }
    // Update streak on successful expense
    if (!result.error && !result.limitReached) {
      updateStreak();
    }
    // AddExpense expects result.success, so add it
    return { ...result, success: !result.error && !result.limitReached };
  };

  const handleUpgrade = () => {
    // TODO: Integrate Stripe checkout
    setShowPaywall(false);
    alert('Stripe integration coming soon!');
  };

  // Calculate category totals
  const currentMonth = getLocalMonthString();
  const monthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
  const categoryTotals = DEFAULT_CATEGORIES.map(cat => {
    const total = monthExpenses
      .filter(e => e.category_id === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...cat, total };
  }).filter(c => c.total > 0);

  // Streak info from settings
  const streakInfo = {
    current: settings?.streakData?.currentStreak || 0,
    longest: settings?.streakData?.longestStreak || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <Dashboard
            key="dashboard"
            monthTotal={monthTotal}
            expenses={expenses}
            categories={DEFAULT_CATEGORIES}
            categoryTotals={categoryTotals}
            settings={{ ...settings, isPremium }}
            monthCount={monthCount}
            streakInfo={streakInfo}
            onAddClick={handleAddClick}
            onHistoryClick={() => setView('history')}
            onSettingsClick={() => setView('settings')}
            onCalendarClick={() => setShowCalendar(true)}
          />
        )}
        
        {view === 'history' && (
          <History
            key="history"
            expenses={expenses}
            categories={DEFAULT_CATEGORIES}
            onDelete={deleteExpense}
            onBack={() => setView('dashboard')}
          />
        )}
        
        {view === 'settings' && (
          <Settings
            key="settings"
            settings={{ ...settings, isPremium }}
            categories={DEFAULT_CATEGORIES}
            onUpdate={updateSettings}
            onExport={getExpensesForExport}
            onClearAll={clearAllExpenses}
            onBack={() => setView('dashboard')}
            user={user}
            profile={profile}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showAdd && (
          <AddExpense
            categories={DEFAULT_CATEGORIES}
            canAdd={canAddExpense}
            expenses={expenses}
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

      <AnimatePresence>
        {showCalendar && (
          <CalendarView
            expenses={expenses}
            categories={DEFAULT_CATEGORIES}
            settings={{ ...settings, isPremium }}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </AnimatePresence>
      
      {showInstallBanner && !isInstalled && monthCount >= 3 && view === 'dashboard' && (
        <InstallBanner
          canInstall={canInstall}
          isIOS={isIOS}
          onInstall={install}
          onDismiss={() => setShowInstallBanner(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages - accessible without auth */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        
        {/* Main app - wrapped in AuthProvider */}
        <Route path="/*" element={
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
