import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initializeDB } from './db';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';
import History from './pages/History';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import { getSettings } from './db';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeDB();
      const settings = await getSettings();
      setNeedsOnboarding(!settings?.onboardingComplete);
      setIsLoading(false);
    }
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-bounce">🤖</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          {needsOnboarding ? (
            <>
              <Route path="/onboarding" element={<Onboarding onComplete={() => setNeedsOnboarding(false)} />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddExpense />} />
              <Route path="/edit/:id" element={<EditExpense />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
