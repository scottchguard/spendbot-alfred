import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { DashboardV2 as Dashboard } from './components/DashboardV2';
import { InstallBanner } from './components/InstallBanner';
import { FunLoader } from './components/EasterEggs';
import { usePWA } from './hooks/usePWA';
import { getLocalMonthString } from './utils/dateUtils';
import { useSupabaseExpenses } from './hooks/useSupabaseExpenses';
import { useSupabaseSettings } from './hooks/useSupabaseSettings';
import { DEFAULT_CATEGORIES } from './constants/categories';
import { initAudio } from './utils/sounds';

// Lazy load components that aren't needed on initial render
const AddExpense = lazy(() => import('./components/AddExpense').then(m => ({ default: m.AddExpense })));
const History = lazy(() => import('./components/History').then(m => ({ default: m.History })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const Onboarding = lazy(() => import('./components/Onboarding').then(m => ({ default: m.Onboarding })));
const Paywall = lazy(() => import('./components/Paywall').then(m => ({ default: m.Paywall })));
const CalendarView = lazy(() => import('./components/CalendarView').then(m => ({ default: m.CalendarView })));
const PremiumSuccess = lazy(() => import('./components/PremiumSuccess').then(m => ({ default: m.PremiumSuccess })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));

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
      <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><FunLoader message="Loading..." /></div>}>
        <Onboarding 
          onComplete={async () => {
            // Use try/finally to GUARANTEE setShowOnboarding(false) is called
            // User should NEVER be trapped on onboarding screen
            try {
              await updateSettings({ onboardingComplete: true });
            } catch (error) {
              console.error('Failed to save onboarding status:', error);
              // Don't trap the user - they can proceed even if save fails
              // Settings will be created on next successful auth
            } finally {
              setShowOnboarding(false);
            }
          }} 
        />
      </Suspense>
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
          <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><FunLoader message="Loading history..." /></div>}>
            <History
              key="history"
              expenses={expenses}
              categories={DEFAULT_CATEGORIES}
              onDelete={deleteExpense}
              onBack={() => setView('dashboard')}
            />
          </Suspense>
        )}
        
        {view === 'settings' && (
          <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><FunLoader message="Loading settings..." /></div>}>
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
          </Suspense>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showAdd && (
          <Suspense fallback={null}>
            <AddExpense
              categories={DEFAULT_CATEGORIES}
              canAdd={canAddExpense}
              expenses={expenses}
              onSave={handleSave}
              onClose={() => setShowAdd(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showPaywall && (
          <Suspense fallback={null}>
            <Paywall
              monthCount={monthCount}
              onClose={() => setShowPaywall(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCalendar && (
          <Suspense fallback={null}>
            <CalendarView
              expenses={expenses}
              categories={DEFAULT_CATEGORIES}
              settings={{ ...settings, isPremium }}
              onClose={() => setShowCalendar(false)}
            />
          </Suspense>
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

// Minimal fallback for route-level suspense
function RouteFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <FunLoader message="Loading page..." />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages - accessible without auth */}
        <Route path="/privacy" element={
          <Suspense fallback={<RouteFallback />}>
            <PrivacyPage />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<RouteFallback />}>
            <TermsPage />
          </Suspense>
        } />
        
        {/* Premium success page - needs AuthProvider for user context */}
        <Route path="/success" element={
          <AuthProvider>
            <Suspense fallback={<RouteFallback />}>
              <PremiumSuccess />
            </Suspense>
          </AuthProvider>
        } />
        
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
