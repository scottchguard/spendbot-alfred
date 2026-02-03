import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/format';
import { signOut } from '../lib/supabase';
import { Toast } from './Toast';

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="flex-1">
        <div className="text-text-primary font-medium">{label}</div>
        {description && (
          <div className="text-sm text-text-muted mt-0.5">{description}</div>
        )}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );
}

function ConfirmModal({ show, title, message, confirmText, onConfirm, onCancel, danger }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-surface-raised rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
            <p className="text-text-secondary text-sm mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-background rounded-xl text-text-secondary font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  danger ? 'bg-danger text-white' : 'bg-accent text-white'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Settings({ settings, categories, onUpdate, onExport, onClearAll, onBack, user, profile }) {
  // monthlyBudget is stored in cents, display in dollars
  const [budget, setBudget] = useState(settings?.monthlyBudget ? (settings.monthlyBudget / 100).toString() : '');
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  // Sync budget state when settings load/change
  useEffect(() => {
    if (settings?.monthlyBudget !== undefined) {
      setBudget(settings.monthlyBudget ? (settings.monthlyBudget / 100).toString() : '');
    }
  }, [settings?.monthlyBudget]);

  const handleBudgetSave = () => {
    const value = parseFloat(budget);
    if (!isNaN(value) && value > 0) {
      // Convert dollars to cents for storage
      onUpdate({ monthlyBudget: Math.round(value * 100) });
    } else if (budget === '' || budget === '0') {
      onUpdate({ monthlyBudget: null });
    }
    setShowBudgetInput(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const expenses = await onExport();
      
      // Build CSV
      const headers = ['Date', 'Category', 'Amount', 'Note'];
      const rows = expenses.map(e => {
        const cat = categories?.find(c => c.id === e.category_id);
        return [
          new Date(e.date).toISOString(),
          cat?.name || 'Other',
          (e.amount / 100).toFixed(2),
          e.note || ''
        ];
      });
      
      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spendbot-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Show success toast
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3000);
    } finally {
      setExporting(false);
    }
  };

  const handleClearAll = async () => {
    await onClearAll();
    setShowClearConfirm(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    // Auth state change will redirect to login
  };

  // Get provider info from user metadata
  const getProviderName = () => {
    if (!user) return null;
    const provider = user.app_metadata?.provider;
    if (provider === 'google') return 'Google';
    if (provider === 'apple') return 'Apple';
    return 'Email';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between border-b border-border">
        <button onClick={onBack} className="text-accent text-lg">
          ← Back
        </button>
        <h1 className="text-lg font-heading font-semibold text-text-primary">
          Settings
        </h1>
        <div className="w-16" />
      </div>

      <div className="px-6 py-4">
        {/* Account Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wider">
            Account
          </h2>
          <div className="bg-surface-raised rounded-2xl px-4">
            <SettingRow
              label={profile?.full_name || user?.email?.split('@')[0] || 'User'}
              description={user?.email}
            >
              {profile?.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt="" 
                  className="w-10 h-10 rounded-full"
                />
              )}
            </SettingRow>
            <SettingRow
              label="Signed in with"
              description={getProviderName()}
            >
              <button 
                onClick={() => setShowSignOutConfirm(true)}
                className="text-danger font-medium"
              >
                Sign Out
              </button>
            </SettingRow>
          </div>
        </div>

        {/* Budget Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wider">
            Budget
          </h2>
          <div className="bg-surface-raised rounded-2xl px-4">
            <SettingRow
              label="Monthly Budget"
              description={settings?.monthlyBudget ? `Currently ${formatCurrency(settings.monthlyBudget)}` : 'Not set'}
            >
              {showBudgetInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0"
                    className="w-24 px-3 py-1.5 bg-background border border-border rounded-lg text-text-primary text-right focus:outline-none focus:border-accent"
                    autoFocus
                  />
                  <button
                    onClick={handleBudgetSave}
                    className="text-accent font-medium"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowBudgetInput(true)}
                  className="text-accent font-medium"
                >
                  {settings?.monthlyBudget ? 'Edit' : 'Set'}
                </button>
              )}
            </SettingRow>
          </div>
        </div>

        {/* Premium Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wider">
            Subscription
          </h2>
          <div className="bg-surface-raised rounded-2xl px-4">
            <SettingRow
              label="SpendBot Premium"
              description={settings?.isPremium ? 'Lifetime access — unlimited expenses' : '50 expenses/month on free plan'}
            >
              {settings?.isPremium ? (
                <span className="text-success font-medium">Active ✓</span>
              ) : (
                <button 
                  onClick={() => alert('Premium upgrade coming soon! For now, enjoy unlimited tracking.')}
                  className="px-4 py-2 bg-accent text-white rounded-xl font-medium text-sm"
                >
                  Upgrade $9.99
                </button>
              )}
            </SettingRow>
          </div>
        </div>

        {/* Data Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wider">
            Data
          </h2>
          <div className="bg-surface-raised rounded-2xl px-4">
            <SettingRow
              label="Export Data"
              description="Download all expenses as CSV"
            >
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="text-accent font-medium disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </SettingRow>
            <SettingRow
              label="Clear All Data"
              description="Delete all expenses (cannot be undone)"
            >
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="text-danger font-medium"
              >
                Clear
              </button>
            </SettingRow>
          </div>
        </div>

        {/* About Section */}
        <div className="text-center py-8 text-text-muted">
          <div className="text-3xl mb-2">🤖</div>
          <div className="text-sm">SpendBot v1.1.0</div>
          <div className="text-xs mt-1">Built by Loopspur</div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        show={showClearConfirm}
        title="Clear All Data?"
        message="This will permanently delete all your expenses. This action cannot be undone."
        confirmText="Delete Everything"
        danger={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        show={showSignOutConfirm}
        title="Sign Out?"
        message="You'll need to sign in again to access your expenses."
        confirmText={signingOut ? "Signing out..." : "Sign Out"}
        danger={false}
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />

      {/* Export Success Toast */}
      <Toast
        show={showExportSuccess}
        message="✅ Export complete! Check your downloads."
      />
    </motion.div>
  );
}
