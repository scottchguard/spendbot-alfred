// Visual QA Test Page - renders components without auth
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardV2 as Dashboard } from '../components/DashboardV2';
import { AddExpense } from '../components/AddExpense';
import { History } from '../components/History';
import { Settings } from '../components/Settings';
import { Onboarding } from '../components/Onboarding';
import { Paywall } from '../components/Paywall';
import { PremiumSuccess } from '../components/PremiumSuccess';
import { DEFAULT_CATEGORIES } from '../constants/categories';

// Mock data for testing
const MOCK_EXPENSES = [
  { id: '1', amount: 1250, category_id: 'food', date: '2026-02-05', created_at: '2026-02-05T10:00:00Z' },
  { id: '2', amount: 4500, category_id: 'transport', date: '2026-02-04', created_at: '2026-02-04T15:30:00Z' },
  { id: '3', amount: 8999, category_id: 'shopping', date: '2026-02-03', created_at: '2026-02-03T12:00:00Z' },
  { id: '4', amount: 2000, category_id: 'entertainment', date: '2026-02-02', created_at: '2026-02-02T20:00:00Z' },
  { id: '5', amount: 3500, category_id: 'food', date: '2026-02-01', created_at: '2026-02-01T08:00:00Z' },
];

const MOCK_SETTINGS = {
  monthlyBudget: 100000,
  onboardingComplete: true,
  notifications: true,
  streakData: { currentStreak: 5, longestStreak: 12 },
  isPremium: false,
};

const MOCK_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const MOCK_PROFILE = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  is_premium: false,
};

// Mock auth context value for testing without real authentication
const MOCK_AUTH_VALUE = {
  user: MOCK_USER,
  profile: MOCK_PROFILE,
  loading: false,
  updateProfile: async () => ({ data: MOCK_PROFILE, error: null }),
  isAuthenticated: true,
  isPremium: false,
};

export function TestPage() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Calculate mock category totals
  const categoryTotals = DEFAULT_CATEGORIES.map(cat => {
    const total = MOCK_EXPENSES
      .filter(e => e.category_id === cat.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...cat, total };
  }).filter(c => c.total > 0);

  const monthTotal = MOCK_EXPENSES.reduce((sum, e) => sum + e.amount, 0);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard
            monthTotal={monthTotal}
            expenses={MOCK_EXPENSES}
            categories={DEFAULT_CATEGORIES}
            categoryTotals={categoryTotals}
            settings={MOCK_SETTINGS}
            monthCount={MOCK_EXPENSES.length}
            streakInfo={{ current: 5, longest: 12 }}
            onAddClick={() => setShowAdd(true)}
            onHistoryClick={() => setCurrentScreen('history')}
            onSettingsClick={() => setCurrentScreen('settings')}
            onCalendarClick={() => {}}
          />
        );
      case 'history':
        return (
          <History
            expenses={MOCK_EXPENSES}
            categories={DEFAULT_CATEGORIES}
            onDelete={() => {}}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={MOCK_SETTINGS}
            categories={DEFAULT_CATEGORIES}
            onUpdate={() => {}}
            onExport={() => MOCK_EXPENSES}
            onClearAll={() => {}}
            onBack={() => setCurrentScreen('dashboard')}
            user={MOCK_USER}
            profile={MOCK_PROFILE}
          />
        );
      case 'onboarding':
        return (
          <Onboarding onComplete={() => setCurrentScreen('dashboard')} />
        );
      case 'paywall':
        return (
          <Paywall monthCount={50} onClose={() => setCurrentScreen('dashboard')} />
        );
      case 'success':
        return (
          <PremiumSuccess />
        );
      default:
        return null;
    }
  };

  return (
    <AuthContext.Provider value={MOCK_AUTH_VALUE}>
      <div className="min-h-screen bg-background">
        {/* Test Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-sm p-2 flex flex-wrap gap-1 text-xs">
          {['dashboard', 'history', 'settings', 'onboarding', 'paywall', 'success'].map(screen => (
            <button
              key={screen}
              onClick={() => setCurrentScreen(screen)}
              className={`px-2 py-1 rounded ${
                currentScreen === screen ? 'bg-accent text-white' : 'bg-surface-raised text-text-secondary'
              }`}
            >
              {screen}
            </button>
          ))}
          <button
            onClick={() => setShowAdd(true)}
            className="px-2 py-1 rounded bg-green-600 text-white"
          >
            + Add Expense
          </button>
        </div>

        {/* Add padding to account for nav bar */}
        <div className="pt-12">
          <AnimatePresence mode="wait">
            {renderScreen()}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showAdd && (
            <AddExpense
              categories={DEFAULT_CATEGORIES}
              expenses={MOCK_EXPENSES}
              onSave={async () => {
                setShowAdd(false);
                return { success: true };
              }}
              onClose={() => setShowAdd(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}
// Deploy trigger 1770313196
