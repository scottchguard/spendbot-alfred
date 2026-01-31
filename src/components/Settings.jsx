import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/format';

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border">
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

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-surface-raised'
      }`}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
      />
    </button>
  );
}

export function Settings({ settings, onUpdate, onBack }) {
  const [budget, setBudget] = useState(settings?.monthlyBudget || '');
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  const handleBudgetSave = () => {
    const value = parseFloat(budget);
    if (!isNaN(value) && value > 0) {
      onUpdate({ monthlyBudget: value });
    } else if (budget === '' || budget === '0') {
      onUpdate({ monthlyBudget: null });
    }
    setShowBudgetInput(false);
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
              description={settings?.isPremium ? 'Unlimited expenses' : '50 expenses/month on free plan'}
            >
              {settings?.isPremium ? (
                <span className="text-success font-medium">Active ✓</span>
              ) : (
                <button className="px-4 py-2 bg-accent text-white rounded-xl font-medium text-sm">
                  Upgrade $4.99/mo
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
              <button className="text-accent font-medium">
                Export
              </button>
            </SettingRow>
            <SettingRow
              label="Clear All Data"
              description="Delete all expenses (cannot be undone)"
            >
              <button className="text-danger font-medium">
                Clear
              </button>
            </SettingRow>
          </div>
        </div>

        {/* About Section */}
        <div className="text-center py-8 text-text-muted">
          <div className="text-3xl mb-2">🤖</div>
          <div className="text-sm">SpendBot v1.0.0</div>
          <div className="text-xs mt-1">Built by Loopspur</div>
        </div>
      </div>
    </motion.div>
  );
}
