# SpendBot Redesign Specification

**Design Director:** Raphael  
**Date:** 2026-02-07  
**Version:** 2.0  
**For:** Isaiah (Engineering Lead)  
**Status:** COMPLETE — All 6 screens specified

---

## Design System Foundation

### Color Palette

> **NOTE:** These tokens align with the existing Tailwind config in `tailwind.config.js`. The codebase uses **indigo (#6366F1)** as the primary accent, not green. Green is reserved for success/positive states.

```css
:root {
  /* Backgrounds — deep, rich, premium feel */
  --bg-primary: #08080C;          /* background */
  --bg-secondary: #111116;        /* surface */
  --bg-card: #18181F;             /* surface-raised */
  --bg-elevated: #1F1F28;         /* surface-elevated */
  --border: #2A2A35;
  --border-subtle: #1F1F28;
  
  /* Text hierarchy */
  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  --text-disabled: #52525B;
  
  /* Accent — vibrant indigo/purple */
  --accent: #6366F1;
  --accent-hover: #818CF8;
  --accent-muted: #4F46E5;
  --accent-glow: rgba(99, 102, 241, 0.4);
  
  /* Status */
  --success: #10B981;
  --success-muted: #059669;
  --warning: #F59E0B;
  --warning-muted: #D97706;
  --error: #EF4444;
  --error-muted: #DC2626;
  
  /* Category colors */
  --cat-food: #FB923C;
  --cat-transport: #60A5FA;
  --cat-groceries: #34D399;
  --cat-entertainment: #C084FC;
  --cat-bills: #94A3B8;
  --cat-shopping: #F472B6;
  --cat-health: #F87171;
  --cat-travel: #22D3EE;
  --cat-subscriptions: #A78BFA;
  --cat-coffee: #FBBF24;
  --cat-other: #9CA3AF;
  
  /* Gradients */
  --gradient-accent: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  --gradient-success: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  --gradient-premium: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  --gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  --gradient-glass-accent: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%);
  
  /* Shadows */
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
  --shadow-glow-lg: 0 0 40px rgba(99, 102, 241, 0.4);
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);
}
```

### Typography Scale

> **Font stacks** (from Tailwind config):
> - **Display (numbers):** SF Mono → JetBrains Mono → Menlo → monospace
> - **Heading:** Plus Jakarta Sans → SF Pro Display → system-ui
> - **Body:** Inter → SF Pro Text → system-ui

```css
/* Display Large - Hero numbers (e.g., total spent) */
.text-display-lg {
  font-family: var(--font-display);   /* SF Mono / JetBrains Mono */
  font-size: 3.5rem;   /* 56px */
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

/* Display - Secondary numbers */
.text-display {
  font-family: var(--font-display);
  font-size: 2.5rem;   /* 40px */
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* Display Small - Stat numbers */
.text-display-sm {
  font-family: var(--font-display);
  font-size: 2rem;     /* 32px */
  font-weight: 600;
  line-height: 1.2;
}

/* Heading - Section titles */
.text-heading {
  font-family: var(--font-heading);   /* Plus Jakarta Sans */
  font-size: 1.25rem;  /* 20px */
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Body - Regular text */
.text-body {
  font-family: var(--font-body);      /* Inter */
  font-size: 1rem;     /* 16px */
  font-weight: 400;
  line-height: 1.5;
}

/* Caption - Secondary info */
.text-caption {
  font-family: var(--font-body);
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  color: var(--text-secondary);
}

/* Micro - Labels, badges */
.text-micro {
  font-family: var(--font-body);
  font-size: 0.75rem;  /* 12px */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Spacing System (8px base)

```css
--space-1: 4px;    /* Micro */
--space-2: 8px;    /* Tight */
--space-3: 12px;   /* Compact */
--space-4: 16px;   /* Standard */
--space-5: 24px;   /* Comfortable */
--space-6: 32px;   /* Section */
--space-8: 48px;   /* Major */
--space-10: 64px;  /* Hero */
```

### Animation Tokens

```css
/* Timing */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;

/* Easing */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## 1. ONBOARDING

### Overview
Three screens that showcase value through actual app previews. Each screen features a device mockup showing SpendBot UI.

### Screen Flow
```
[1. Fresh Start] → [2. One-Tap Tracking] → [3. No Subscriptions] → [Auth]
```

---

### Screen 1: Fresh Start

```
┌─────────────────────────────────────────┐
│                                         │
│              ● ○ ○                      │  ← Progress dots
│                                         │
│         ┌─────────────────┐             │
│         │   February 2026 │             │
│         │                 │             │
│         │     $0.00       │             │  ← Phone mockup
│         │   ━━━━━━━━━━━   │             │     showing dashboard
│         │   Start Fresh   │             │
│         │                 │             │
│         │  [ + Add ]      │             │
│         └─────────────────┘             │
│                                         │
│         🤖                              │  ← Small robot (48px)
│                                         │
│     Zero-friction tracking              │  ← Headline
│                                         │
│   One tap. No spreadsheets.             │  ← Subhead
│   Finally, budgeting that               │
│   doesn't feel like work.               │
│                                         │
│                                         │
│     ┌─────────────────────────────┐     │
│     │        Continue →           │     │  ← Primary button
│     └─────────────────────────────┘     │
│                                         │
│            Skip                         │  ← Text link
│                                         │
└─────────────────────────────────────────┘
```

**CSS Specs:**
```css
.onboarding-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  background: var(--bg-primary);
}

.progress-dots {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  margin-bottom: var(--space-6);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: all var(--duration-normal) var(--ease-out);
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background: var(--accent);
}

.phone-mockup {
  width: 200px;
  height: 400px;
  margin: 0 auto var(--space-6);
  border-radius: 24px;
  border: 3px solid var(--bg-elevated);
  background: var(--bg-secondary);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.robot-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-4);
}

.headline {
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--space-2);
}

.subhead {
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  max-width: 280px;
  margin: 0 auto var(--space-8);
}
```

**Component Structure:**
```tsx
interface OnboardingStep {
  mockupContent: ReactNode;  // Dashboard preview, Add expense, etc.
  emoji: string;             // Small accent emoji
  headline: string;
  subhead: string;
}

const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  
  const steps: OnboardingStep[] = [
    {
      mockupContent: <DashboardPreview />,
      emoji: "🤖",
      headline: "Zero-friction tracking",
      subhead: "One tap. No spreadsheets. Finally, budgeting that doesn't feel like work."
    },
    // ... steps 2 & 3
  ];
  
  return (
    <motion.div className="onboarding-screen">
      <ProgressDots current={step} total={3} />
      <PhoneMockup>{steps[step].mockupContent}</PhoneMockup>
      <span className="robot-icon">{steps[step].emoji}</span>
      <h1 className="headline">{steps[step].headline}</h1>
      <p className="subhead">{steps[step].subhead}</p>
      <Button onClick={() => step < 2 ? setStep(step + 1) : navigate('/auth')}>
        {step < 2 ? 'Continue' : 'Get Started'}
      </Button>
      <button className="skip-link" onClick={() => navigate('/auth')}>
        Skip
      </button>
    </motion.div>
  );
};
```

---

### Screen 2: One-Tap Tracking

```
┌─────────────────────────────────────────┐
│                                         │
│              ○ ● ○                      │
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │     $ 45.00     │             │
│         │                 │             │  ← Phone showing
│         │  🍔 🚗 🛒 🎬    │             │     add expense UI
│         │                 │             │
│         │  [1] [2] [3]    │             │
│         │  [4] [5] [6]    │             │
│         │  [7] [8] [9]    │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│         📱                              │
│                                         │
│     See where every dollar goes         │
│                                         │
│   Pick a category, tap the amount,      │
│   done. Faster than opening             │
│   a spreadsheet.                        │
│                                         │
│                                         │
│     ┌─────────────────────────────┐     │
│     │        Continue →           │     │
│     └─────────────────────────────┘     │
│                                         │
│            Skip                         │
│                                         │
└─────────────────────────────────────────┘
```

---

### Screen 3: No Subscriptions

```
┌─────────────────────────────────────────┐
│                                         │
│              ○ ○ ●                      │
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │   ✨ Premium    │             │
│         │                 │             │  ← Phone showing
│         │   $4.99 ONCE    │             │     premium badge
│         │   ═══════════   │             │
│         │   ✓ Unlimited   │             │
│         │   ✓ Insights    │             │
│         │   ✓ Export      │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│         💰                              │
│                                         │
│     No subscriptions. Ever.             │
│                                         │
│   $4.99 once. Yours forever.            │
│   While others charge $100/year,        │
│   we believe in fair pricing.           │
│                                         │
│                                         │
│     ┌─────────────────────────────┐     │
│     │      Get Started →          │     │  ← Accent gradient
│     └─────────────────────────────┘     │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2. DASHBOARD

### Overview
Simplified 3-zone layout: Hero Total → Quick Stats → Recent Transactions

---

### Layout Structure

```
┌─────────────────────────────────────────┐
│                                         │
│  February 2026              🤖 📅 ⚙️   │  ← HEADER
│  21 days left                           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│              $1,234.56                  │  ← ZONE 1: Hero
│                                         │     The Big Number
│     ━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%     │
│     $2,750 budget                       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────┐ ┌───────────────┐   │  ← ZONE 2: Quick Stats
│  │  📅 Today     │ │  📆 This Week │   │     Just 2 cards
│  │               │ │               │   │
│  │    $45.00     │ │   $389.20     │   │
│  │   3 expenses  │ │  12 expenses  │   │
│  └───────────────┘ └───────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Recent                        See All →│  ← ZONE 3: Recent
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ┃ 🍔  Food                 -$23.50 ││
│  │ ┃     Chipotle • 10:30 AM          ││
│  ├─────────────────────────────────────┤│
│  │ ┃ ☕  Coffee                 -$6.75 ││
│  │ ┃     Starbucks • 8:45 AM          ││
│  ├─────────────────────────────────────┤│
│  │ ┃ 🚗  Transport             -$15.00 ││
│  │ ┃     Uber • Yesterday             ││
│  ├─────────────────────────────────────┤│
│  │ ┃ 🛒  Groceries             -$87.34 ││
│  │ ┃     Whole Foods • Yesterday      ││
│  └─────────────────────────────────────┘│
│                                         │
│                                         │
│                                         │
│              ┌───────┐                  │  ← FAB
│              │   +   │                  │
│              └───────┘                  │
│                                         │
└─────────────────────────────────────────┘
```

---

### Header Component

```
┌─────────────────────────────────────────┐
│                                         │
│  February 2026              🤖 📅 ⚙️   │
│  21 days left • 🔥 5 day streak         │
│                                         │
└─────────────────────────────────────────┘
```

**CSS Specs:**
```css
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-4);
  padding-top: calc(var(--space-4) + env(safe-area-inset-top));
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.month-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.days-remaining {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 12px;
  font-size: 0.75rem;
  color: #EF4444;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--bg-secondary);
  font-size: 1.25rem;
  transition: background var(--duration-fast);
}

.header-icon:active {
  background: var(--bg-elevated);
}
```

**Component Structure:**
```tsx
const DashboardHeader: React.FC = () => {
  const { currentMonth, daysRemaining, streak } = useBudgetPeriod();
  
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="month-title">{currentMonth}</h1>
        <div className="days-remaining">
          {daysRemaining} days left
          {streak > 0 && (
            <span className="streak-badge">🔥 {streak} day streak</span>
          )}
        </div>
      </div>
      <div className="header-actions">
        <button className="header-icon" aria-label="Robot buddy">🤖</button>
        <button className="header-icon" aria-label="Calendar">📅</button>
        <button className="header-icon" aria-label="Settings">⚙️</button>
      </div>
    </header>
  );
};
```

---

### Zone 1: Hero Total

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              $1,234.56                  │  ← 64px, weight 800
│                                         │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%     │  ← Progress bar
│     $2,750 budget                       │  ← Caption below
│                                         │
└─────────────────────────────────────────┘
```

**CSS Specs:**
```css
.hero-section {
  text-align: center;
  padding: var(--space-6) var(--space-4);
}

.hero-amount {
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: var(--space-4);
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glow effect behind amount */
.hero-amount::before {
  content: attr(data-amount);
  position: absolute;
  filter: blur(40px);
  opacity: 0.4;
  z-index: -1;
}

.budget-progress {
  max-width: 280px;
  margin: 0 auto;
}

.progress-bar {
  height: 8px;
  background: var(--bg-elevated);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.progress-fill {
  height: 100%;
  background: var(--gradient-accent);
  border-radius: 4px;
  transition: width var(--duration-slow) var(--ease-out);
}

/* Warning state: >80% of budget */
.progress-fill.warning {
  background: linear-gradient(90deg, var(--warning) 0%, #D97706 100%);
}

/* Danger state: >100% of budget */
.progress-fill.danger {
  background: linear-gradient(90deg, var(--error) 0%, #DC2626 100%);
}

.budget-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

**Component Structure:**
```tsx
interface HeroSectionProps {
  totalSpent: number;
  budget: number | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ totalSpent, budget }) => {
  const percentage = budget ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const status = percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : 'normal';
  
  return (
    <section className="hero-section">
      <motion.h2 
        className="hero-amount"
        data-amount={formatCurrency(totalSpent)}
        key={totalSpent}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {formatCurrency(totalSpent)}
      </motion.h2>
      
      {budget && (
        <div className="budget-progress">
          <div className="progress-bar">
            <motion.div 
              className={`progress-fill ${status}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="budget-label">
            {formatCurrency(budget)} budget
          </span>
        </div>
      )}
    </section>
  );
};
```

---

### Zone 2: Quick Stats

```
┌───────────────────┐ ┌───────────────────┐
│  📅 Today         │ │  📆 This Week     │
│                   │ │                   │
│     $45.00        │ │    $389.20        │
│    3 expenses     │ │   12 expenses     │
└───────────────────┘ └───────────────────┘
```

**CSS Specs:**
```css
.quick-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  margin-bottom: var(--space-5);
}

.stat-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: var(--space-4);
  transition: transform var(--duration-fast);
}

.stat-card:active {
  transform: scale(0.98);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.stat-icon {
  font-size: 1rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.stat-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.stat-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}
```

**Component Structure:**
```tsx
interface StatCardProps {
  icon: string;
  label: string;
  amount: number;
  count: number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, amount, count, onClick }) => (
  <motion.button 
    className="stat-card"
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
  >
    <div className="stat-header">
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
    </div>
    <div className="stat-amount">{formatCurrency(amount)}</div>
    <div className="stat-count">{count} expense{count !== 1 ? 's' : ''}</div>
  </motion.button>
);

const QuickStats: React.FC = () => {
  const { today, thisWeek } = useExpenseStats();
  
  return (
    <div className="quick-stats">
      <StatCard 
        icon="📅" 
        label="Today" 
        amount={today.total} 
        count={today.count} 
      />
      <StatCard 
        icon="📆" 
        label="This Week" 
        amount={thisWeek.total} 
        count={thisWeek.count} 
      />
    </div>
  );
};
```

---

### Zone 3: Recent Transactions

```
┌─────────────────────────────────────────┐
│  Recent                        See All →│
├─────────────────────────────────────────┤
│ ┃ 🍔  Food                     -$23.50 │  ← Category color border
│ ┃     Chipotle • 10:30 AM              │
├─────────────────────────────────────────┤
│ ┃ ☕  Coffee                    -$6.75 │
│ ┃     Starbucks • 8:45 AM              │
├─────────────────────────────────────────┤
│ ┃ 🚗  Transport                -$15.00 │
│ ┃     Uber • Yesterday                 │
└─────────────────────────────────────────┘
```

**CSS Specs:**
```css
.recent-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 var(--space-4);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.see-all-link {
  font-size: 0.875rem;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 4px;
}

.transaction-list {
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid var(--category-color);
  border-bottom: 1px solid var(--bg-elevated);
  transition: background var(--duration-fast);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-item:active {
  background: var(--bg-elevated);
}

.transaction-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 10px;
  font-size: 1.25rem;
  margin-right: var(--space-3);
}

.transaction-details {
  flex: 1;
  min-width: 0;
}

.transaction-category {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}

.transaction-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.transaction-amount {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
}
```

**Component Structure:**
```tsx
interface TransactionItemProps {
  expense: Expense;
  onClick: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ expense, onClick }) => {
  const category = getCategory(expense.category);
  
  return (
    <motion.button
      className="transaction-item"
      style={{ '--category-color': category.color } as React.CSSProperties}
      onClick={onClick}
      whileTap={{ scale: 0.99 }}
    >
      <div className="transaction-icon">{category.icon}</div>
      <div className="transaction-details">
        <div className="transaction-category">{category.name}</div>
        <div className="transaction-meta">
          {expense.note && `${expense.note} • `}
          {formatTime(expense.createdAt)}
        </div>
      </div>
      <div className="transaction-amount">
        -{formatCurrency(expense.amount)}
      </div>
    </motion.button>
  );
};

const RecentTransactions: React.FC = () => {
  const expenses = useRecentExpenses(5);
  const navigate = useNavigate();
  
  if (expenses.length === 0) {
    return <EmptyState type="no-expenses" />;
  }
  
  return (
    <section className="recent-section">
      <div className="section-header">
        <h3 className="section-title">Recent</h3>
        <button className="see-all-link" onClick={() => navigate('/history')}>
          See All →
        </button>
      </div>
      <div className="transaction-list">
        {expenses.map(expense => (
          <TransactionItem 
            key={expense.id} 
            expense={expense}
            onClick={() => navigate(`/expense/${expense.id}`)}
          />
        ))}
      </div>
    </section>
  );
};
```

---

### FAB (Floating Action Button)

```
          ┌─────────┐
          │    +    │
          └─────────┘
```

**CSS Specs:**
```css
.fab {
  position: fixed;
  bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  
  width: 64px;
  height: 64px;
  border-radius: 50%;
  
  background: var(--gradient-accent);
  box-shadow: 
    0 4px 20px rgba(99, 102, 241, 0.4),
    0 0 0 4px rgba(99, 102, 241, 0.1);
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  font-size: 2rem;
  color: white;
  
  z-index: 100;
}

.fab:active {
  transform: translateX(-50%) scale(0.95);
}

/* Pulse animation for first-time users */
@keyframes fab-pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 4px 30px rgba(99, 102, 241, 0.6); }
}

.fab.pulse {
  animation: fab-pulse 2s ease-in-out infinite;
}
```

**Component Structure:**
```tsx
const FAB: React.FC = () => {
  const navigate = useNavigate();
  const { isFirstTimeUser } = useUserPrefs();
  
  return (
    <motion.button
      className={`fab ${isFirstTimeUser ? 'pulse' : ''}`}
      onClick={() => navigate('/add')}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      aria-label="Add expense"
    >
      +
    </motion.button>
  );
};
```

---

## 3. ADD EXPENSE FLOW

### Overview
Full-screen number pad interface optimized for one-handed use.

---

### Layout

```
┌─────────────────────────────────────────┐
│                                         │
│  ←  Add Expense                 Cancel  │  ← Header
│                                         │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│              $  4  5  0  0              │  ← Amount display
│                                         │
│              ─────────────              │  ← Subtle underline
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Quick: ☕ $6    🍔 $15    🚗 $25      │  ← Quick suggestions
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  🍔  🚗  🛒  🎬  🏠  💊  🎁  ✈️  ➕  │  ← Categories (scroll)
│     ────                                │  ← Selection indicator
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    ┌─────┐  ┌─────┐  ┌─────┐           │
│    │  1  │  │  2  │  │  3  │           │
│    └─────┘  └─────┘  └─────┘           │
│                                         │
│    ┌─────┐  ┌─────┐  ┌─────┐           │
│    │  4  │  │  5  │  │  6  │           │  ← Number pad
│    └─────┘  └─────┘  └─────┘           │
│                                         │
│    ┌─────┐  ┌─────┐  ┌─────┐           │
│    │  7  │  │  8  │  │  9  │           │
│    └─────┘  └─────┘  └─────┘           │
│                                         │
│    ┌─────┐  ┌─────┐  ┌─────┐           │
│    │ 00  │  │  0  │  │  ⌫  │           │
│    └─────┘  └─────┘  └─────┘           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │         ✓ Save Expense              ││  ← Primary button
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

---

### Amount Display

```css
.amount-display {
  text-align: center;
  padding: var(--space-6) var(--space-4);
}

.amount-value {
  font-size: 3.5rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.amount-currency {
  font-size: 2rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: var(--space-2);
}

.amount-underline {
  width: 200px;
  height: 2px;
  background: var(--bg-elevated);
  margin: var(--space-3) auto 0;
  border-radius: 1px;
}

/* Digit animation */
.digit-enter {
  animation: digitPop 150ms var(--ease-spring);
}

@keyframes digitPop {
  0% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
```

---

### Quick Suggestions

```css
.quick-suggestions {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  overflow-x: auto;
  scrollbar-width: none;
}

.quick-chip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-card);
  border-radius: 20px;
  border: 1px solid var(--bg-elevated);
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
}

.quick-chip:active {
  background: var(--bg-elevated);
}

.quick-chip-icon {
  font-size: 1rem;
}
```

**Component Structure:**
```tsx
interface QuickSuggestion {
  categoryId: string;
  icon: string;
  amount: number;
}

const QuickSuggestions: React.FC<{
  onSelect: (categoryId: string, amount: number) => void;
}> = ({ onSelect }) => {
  const suggestions = useQuickSuggestions(); // Based on recent history
  
  return (
    <div className="quick-suggestions">
      {suggestions.map(s => (
        <button
          key={`${s.categoryId}-${s.amount}`}
          className="quick-chip"
          onClick={() => onSelect(s.categoryId, s.amount)}
        >
          <span className="quick-chip-icon">{s.icon}</span>
          ${s.amount}
        </button>
      ))}
    </div>
  );
};
```

---

### Category Selector

```css
.category-selector {
  position: relative;
  padding: var(--space-3) 0;
}

.category-scroll {
  display: flex;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

/* Fade edges */
.category-selector::before,
.category-selector::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  z-index: 1;
}

.category-selector::before {
  left: 0;
  background: linear-gradient(90deg, var(--bg-primary), transparent);
}

.category-selector::after {
  right: 0;
  background: linear-gradient(-90deg, var(--bg-primary), transparent);
}

.category-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  scroll-snap-align: center;
}

.category-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: 16px;
  font-size: 1.5rem;
  border: 2px solid transparent;
  transition: all var(--duration-fast);
}

.category-item.selected .category-icon {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--accent);
}

.category-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  max-width: 60px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-item.selected .category-label {
  color: var(--accent);
  font-weight: 500;
}
```

---

### Number Pad

```css
.number-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  padding: var(--space-4);
}

.pad-button {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: 16px;
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--text-primary);
  transition: all var(--duration-fast);
  -webkit-tap-highlight-color: transparent;
}

.pad-button:active {
  background: var(--bg-elevated);
  transform: scale(0.97);
}

.pad-button.delete {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.pad-button.disabled {
  opacity: 0.3;
  pointer-events: none;
}
```

**Component Structure:**
```tsx
const NumberPad: React.FC<{
  onDigit: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}> = ({ onDigit, onDelete, disabled }) => {
  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '00', '0', 'delete'
  ];
  
  const handlePress = (btn: string) => {
    if (disabled) return;
    if (btn === 'delete') {
      onDelete();
    } else {
      onDigit(btn);
    }
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };
  
  return (
    <div className="number-pad">
      {buttons.map(btn => (
        <motion.button
          key={btn}
          className={`pad-button ${btn === 'delete' ? 'delete' : ''}`}
          onClick={() => handlePress(btn)}
          whileTap={{ scale: 0.97 }}
        >
          {btn === 'delete' ? '⌫' : btn}
        </motion.button>
      ))}
    </div>
  );
};
```

---

### Save Button

```css
.save-button {
  margin: 0 var(--space-4) var(--space-4);
  padding: var(--space-4);
  background: var(--gradient-accent);
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.save-button:disabled {
  opacity: 0.5;
  box-shadow: none;
}

.save-button:active:not(:disabled) {
  transform: scale(0.98);
}
```

---

### Success Animation

```tsx
const SuccessOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <motion.div
      className="success-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="success-check"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        ✓
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Expense saved! 🎯
      </motion.p>
    </motion.div>
  );
};
```

```css
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  z-index: 200;
}

.success-check {
  width: 80px;
  height: 80px;
  background: var(--accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}
```

---

## 4. SETTINGS SCREEN

### Layout

```
┌─────────────────────────────────────────┐
│                                         │
│  ←  Settings                            │  ← Header
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ACCOUNT                                │
│  ┌─────────────────────────────────────┐│
│  │  📧  Email                          ││
│  │      user@example.com            →  ││
│  ├─────────────────────────────────────┤│
│  │  🔐  Password                    →  ││
│  ├─────────────────────────────────────┤│
│  │  🚪  Sign Out                    →  ││
│  └─────────────────────────────────────┘│
│                                         │
│  BUDGET                                 │
│  ┌─────────────────────────────────────┐│
│  │  💰  Monthly Budget                 ││
│  │      $2,750                      →  ││
│  ├─────────────────────────────────────┤│
│  │  📅  Budget Start Day               ││
│  │      1st of month                →  ││
│  └─────────────────────────────────────┘│
│                                         │
│  CATEGORIES                             │
│  ┌─────────────────────────────────────┐│
│  │  🍔  Food                 $890   →  ││
│  ├─────────────────────────────────────┤│
│  │  🚗  Transport            $456   →  ││
│  ├─────────────────────────────────────┤│
│  │  🛒  Groceries            $234   →  ││
│  ├─────────────────────────────────────┤│
│  │  ➕  Add Category                →  ││
│  └─────────────────────────────────────┘│
│                                         │
│  DATA                                   │
│  ┌─────────────────────────────────────┐│
│  │  📤  Export to CSV               →  ││
│  ├─────────────────────────────────────┤│
│  │  🗑️  Clear All Data              →  ││
│  └─────────────────────────────────────┘│
│                                         │
│  SUPPORT                                │
│  ┌─────────────────────────────────────┐│
│  │  ❓  Help & FAQ                  →  ││
│  ├─────────────────────────────────────┤│
│  │  💬  Contact Support             →  ││
│  ├─────────────────────────────────────┤│
│  │  ⭐  Rate SpendBot               →  ││
│  └─────────────────────────────────────┘│
│                                         │
│         ┌───────────────────┐           │
│         │  ✨ Upgrade to    │           │  ← Premium CTA
│         │     Premium       │           │     (if free user)
│         └───────────────────┘           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         🤖 SpendBot v1.1.0             │
│         Made by Loopspur               │
│                                         │
│     Privacy  •  Terms  •  Licenses     │
│                                         │
└─────────────────────────────────────────┘
```

---

### CSS Specs

```css
.settings-screen {
  min-height: 100dvh;
  background: var(--bg-primary);
  padding-bottom: calc(var(--space-8) + env(safe-area-inset-bottom));
}

.settings-header {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  padding-top: calc(var(--space-4) + env(safe-area-inset-top));
}

.back-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.settings-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-left: var(--space-3);
}

/* Section */
.settings-section {
  margin-bottom: var(--space-5);
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: 0 var(--space-4);
  margin-bottom: var(--space-2);
}

.settings-group {
  background: var(--bg-card);
  margin: 0 var(--space-4);
  border-radius: 16px;
  overflow: hidden;
}

/* Row */
.settings-row {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--bg-elevated);
}

.settings-row:last-child {
  border-bottom: none;
}

.settings-row:active {
  background: var(--bg-elevated);
}

.row-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 1rem;
  margin-right: var(--space-3);
}

.row-content {
  flex: 1;
  min-width: 0;
}

.row-label {
  font-size: 1rem;
  color: var(--text-primary);
}

.row-value {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.row-meta {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-left: var(--space-2);
}

.row-arrow {
  color: var(--text-muted);
  font-size: 1rem;
}

/* Destructive row */
.settings-row.destructive .row-label {
  color: var(--error);
}

/* Premium CTA */
.premium-cta {
  margin: var(--space-6) var(--space-4);
  padding: var(--space-4);
  background: var(--gradient-premium);
  border-radius: 16px;
  text-align: center;
}

.premium-cta-label {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

/* Footer */
.settings-footer {
  text-align: center;
  padding: var(--space-6) var(--space-4);
}

.app-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
}

.footer-link {
  font-size: 0.875rem;
  color: var(--text-muted);
}
```

---

### Component Structure

```tsx
interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  meta?: string;
  destructive?: boolean;
  onClick: () => void;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon, label, value, meta, destructive, onClick
}) => (
  <button 
    className={`settings-row ${destructive ? 'destructive' : ''}`}
    onClick={onClick}
  >
    <div className="row-icon">{icon}</div>
    <div className="row-content">
      <div className="row-label">{label}</div>
      {value && <div className="row-value">{value}</div>}
    </div>
    {meta && <span className="row-meta">{meta}</span>}
    <span className="row-arrow">›</span>
  </button>
);

const SettingsScreen: React.FC = () => {
  const { user, isPremium } = useAuth();
  const { budget, categories } = useUserData();
  
  return (
    <div className="settings-screen">
      <header className="settings-header">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        <h1 className="settings-title">Settings</h1>
      </header>
      
      {/* Account Section */}
      <section className="settings-section">
        <div className="section-label">Account</div>
        <div className="settings-group">
          <SettingsRow 
            icon="📧" 
            label="Email" 
            value={user?.email}
            onClick={() => {}}
          />
          <SettingsRow icon="🔐" label="Password" onClick={() => {}} />
          <SettingsRow icon="🚪" label="Sign Out" onClick={signOut} />
        </div>
      </section>
      
      {/* Budget Section */}
      <section className="settings-section">
        <div className="section-label">Budget</div>
        <div className="settings-group">
          <SettingsRow 
            icon="💰" 
            label="Monthly Budget" 
            value={formatCurrency(budget)}
            onClick={() => openBudgetModal()}
          />
          <SettingsRow 
            icon="📅" 
            label="Budget Start Day" 
            value="1st of month"
            onClick={() => {}}
          />
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="settings-section">
        <div className="section-label">Categories</div>
        <div className="settings-group">
          {categories.map(cat => (
            <SettingsRow
              key={cat.id}
              icon={cat.icon}
              label={cat.name}
              meta={formatCurrency(cat.thisMonth)}
              onClick={() => openCategoryModal(cat)}
            />
          ))}
          <SettingsRow 
            icon="➕" 
            label="Add Category" 
            onClick={() => openCategoryModal(null)}
          />
        </div>
      </section>
      
      {/* Data Section */}
      <section className="settings-section">
        <div className="section-label">Data</div>
        <div className="settings-group">
          <SettingsRow icon="📤" label="Export to CSV" onClick={exportCSV} />
          <SettingsRow 
            icon="🗑️" 
            label="Clear All Data" 
            destructive
            onClick={confirmClearData}
          />
        </div>
      </section>
      
      {/* Premium CTA */}
      {!isPremium && (
        <button className="premium-cta" onClick={openPaywall}>
          <span className="premium-cta-label">✨ Upgrade to Premium</span>
        </button>
      )}
      
      {/* Footer */}
      <footer className="settings-footer">
        <div className="app-info">
          🤖 SpendBot v1.1.0 • Made by Loopspur
        </div>
        <div className="footer-links">
          <a href="/privacy" className="footer-link">Privacy</a>
          <a href="/terms" className="footer-link">Terms</a>
          <a href="/licenses" className="footer-link">Licenses</a>
        </div>
      </footer>
    </div>
  );
};
```

---

## 5. PAYMENT/UPGRADE MODAL

### Layout

```
┌─────────────────────────────────────────┐
│                                         │
│               ─────                     │  ← Drag handle
│                                         │
│              ✨ 🤖 ✨                   │  ← Robot with sparkles
│                                         │
│       Unlock the full experience        │  ← Headline
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  "Best $5 I've spent on an app!"       │  ← Testimonial
│   ⭐⭐⭐⭐⭐  — App Store Review        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │          FREE      PREMIUM         ││
│  ├─────────────────────────────────────┤│
│  │ Expenses   50/mo    Unlimited ✓    ││
│  │ Categories    6     Unlimited ✓    ││
│  │ Insights   Basic    Advanced ✓     ││
│  │ Export       ✗      CSV ✓          ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│                                         │
│       ┌─────────────────────────┐       │
│       │    $4.99 once           │       │  ← Price badge
│       │    ──────────────────   │       │
│       │    No subscriptions     │       │
│       └─────────────────────────┘       │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │      ⚡ Upgrade Now                 ││  ← Primary CTA (pulsing)
│  └─────────────────────────────────────┘│
│                                         │
│             Maybe Later                 │  ← Dismiss link
│                                         │
│  🔒 Secure payment via App Store       │  ← Trust badge
│                                         │
└─────────────────────────────────────────┘
```

---

### CSS Specs

```css
.paywall-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}

.paywall-sheet {
  width: 100%;
  max-height: 90vh;
  background: var(--bg-secondary);
  border-radius: 24px 24px 0 0;
  padding: var(--space-4);
  padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.drag-handle {
  width: 36px;
  height: 4px;
  background: var(--bg-elevated);
  border-radius: 2px;
  margin: 0 auto var(--space-5);
}

.paywall-hero {
  text-align: center;
  margin-bottom: var(--space-5);
}

.robot-premium {
  font-size: 3rem;
  margin-bottom: var(--space-3);
}

.paywall-headline {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Testimonial */
.testimonial {
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  text-align: center;
}

.testimonial-quote {
  font-size: 1rem;
  font-style: italic;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.testimonial-source {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Comparison table */
.comparison-table {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: var(--space-5);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--space-3);
  background: var(--bg-elevated);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: var(--space-3);
  border-bottom: 1px solid var(--bg-elevated);
  font-size: 0.875rem;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-cell.feature {
  justify-content: flex-start;
  color: var(--text-primary);
}

.table-cell.free {
  color: var(--text-muted);
}

.table-cell.premium {
  color: var(--accent);
  font-weight: 500;
}

/* Price badge */
.price-badge {
  text-align: center;
  margin-bottom: var(--space-5);
}

.price-amount {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.price-note {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* CTA button with pulse */
.upgrade-button {
  width: 100%;
  padding: var(--space-4);
  background: var(--gradient-premium);
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  animation: buttonPulse 2s ease-in-out infinite;
}

@keyframes buttonPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 4px 30px rgba(139, 92, 246, 0.5); }
}

.dismiss-link {
  display: block;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

.trust-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  color: var(--text-muted);
}
```

---

### Component Structure

```tsx
const PaywallModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const { purchase, isLoading } = usePurchase();
  
  const features = [
    { name: 'Expenses', free: '50/mo', premium: 'Unlimited ✓' },
    { name: 'Categories', free: '6', premium: 'Unlimited ✓' },
    { name: 'Insights', free: 'Basic', premium: 'Advanced ✓' },
    { name: 'Export', free: '✗', premium: 'CSV ✓' },
  ];
  
  return (
    <motion.div 
      className="paywall-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="paywall-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onDismiss();
        }}
      >
        <div className="drag-handle" />
        
        <div className="paywall-hero">
          <div className="robot-premium">✨ 🤖 ✨</div>
          <h2 className="paywall-headline">Unlock the full experience</h2>
        </div>
        
        <div className="testimonial">
          <p className="testimonial-quote">"Best $5 I've spent on an app!"</p>
          <p className="testimonial-source">⭐⭐⭐⭐⭐ — App Store Review</p>
        </div>
        
        <div className="comparison-table">
          <div className="table-header">
            <span></span>
            <span>FREE</span>
            <span>PREMIUM</span>
          </div>
          {features.map(f => (
            <div className="table-row" key={f.name}>
              <span className="table-cell feature">{f.name}</span>
              <span className="table-cell free">{f.free}</span>
              <span className="table-cell premium">{f.premium}</span>
            </div>
          ))}
        </div>
        
        <div className="price-badge">
          <div className="price-amount">$4.99 once</div>
          <div className="price-note">No subscriptions. Ever.</div>
        </div>
        
        <button 
          className="upgrade-button"
          onClick={purchase}
          disabled={isLoading}
        >
          ⚡ {isLoading ? 'Processing...' : 'Upgrade Now'}
        </button>
        
        <button className="dismiss-link" onClick={onDismiss}>
          Maybe Later
        </button>
        
        <div className="trust-badge">
          🔒 Secure payment via App Store
        </div>
      </motion.div>
    </motion.div>
  );
};
```

---

## 6. PWA INSTALL EXPERIENCE

### Overview
The PWA install prompt is a critical conversion point. It should feel like a premium upgrade, not a browser nag. Triggered after the user has demonstrated value (3+ expenses logged).

### Trigger Logic
```tsx
const shouldShowInstallPrompt = (expenseCount: number, dismissed: boolean): boolean => {
  // Don't show if already installed as PWA
  if (window.matchMedia('(display-mode: standalone)').matches) return false;
  // Don't show if dismissed in last 7 days
  if (dismissed) return false;
  // Show after 3+ expenses (user has seen value)
  return expenseCount >= 3;
};
```

### Install Modal Layout

```
┌─────────────────────────────────────────┐
│                                         │
│               ─────                     │  ← Drag handle
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │    🤖           │             │  ← Device mockup
│         │   SpendBot      │             │     with app icon
│         │                 │             │     on home screen
│         └─────────────────┘             │
│                                         │
│      Get SpendBot on your               │  ← Headline
│        home screen                      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ⚡  Open instantly                     │  ← Benefit 1
│      No browser needed                  │
│                                         │
│  📡  Works offline                      │  ← Benefit 2
│      Track expenses anywhere            │
│                                         │
│  🔒  Secure & private                   │  ← Benefit 3
│      Biometric login supported          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │      📲 Add to Home Screen          ││  ← Primary CTA
│  └─────────────────────────────────────┘│
│                                         │
│             Not now                     │  ← Dismiss
│                                         │
└─────────────────────────────────────────┘
```

### CSS Specs

```css
.pwa-install-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}

.pwa-install-sheet {
  width: 100%;
  background: var(--bg-secondary);
  border-radius: 24px 24px 0 0;
  padding: var(--space-4);
  padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
}

.device-mockup {
  width: 160px;
  height: 280px;
  margin: 0 auto var(--space-5);
  border-radius: 20px;
  border: 3px solid var(--border);
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  box-shadow: var(--shadow-card);
}

.device-app-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--gradient-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.device-app-label {
  font-size: 0.75rem;
  color: var(--text-primary);
  font-weight: 500;
}

.pwa-headline {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: var(--space-5);
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: 0 var(--space-2);
}

.benefit-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.benefit-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: 10px;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.benefit-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benefit-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.benefit-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.pwa-install-button {
  width: 100%;
  padding: var(--space-4);
  background: var(--gradient-accent);
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  box-shadow: var(--shadow-glow);
}

.pwa-install-button:active {
  transform: scale(0.98);
}

.pwa-dismiss {
  display: block;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
  padding: var(--space-2);
}
```

### Component Structure

```tsx
const PWAInstallModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const { promptInstall, isInstallable } = usePWAInstall();
  
  if (!isInstallable) return null;
  
  const benefits = [
    { icon: '⚡', title: 'Open instantly', desc: 'No browser needed' },
    { icon: '📡', title: 'Works offline', desc: 'Track expenses anywhere' },
    { icon: '🔒', title: 'Secure & private', desc: 'Biometric login supported' },
  ];
  
  return (
    <motion.div
      className="pwa-install-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="pwa-install-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onDismiss();
        }}
      >
        <div className="drag-handle" />
        
        <div className="device-mockup">
          <div className="device-app-icon">🤖</div>
          <span className="device-app-label">SpendBot</span>
        </div>
        
        <h2 className="pwa-headline">
          Get SpendBot on your<br />home screen
        </h2>
        
        <div className="benefits-list">
          {benefits.map(b => (
            <div className="benefit-row" key={b.title}>
              <div className="benefit-icon">{b.icon}</div>
              <div className="benefit-text">
                <span className="benefit-title">{b.title}</span>
                <span className="benefit-desc">{b.desc}</span>
              </div>
            </div>
          ))}
        </div>
        
        <button className="pwa-install-button" onClick={promptInstall}>
          📲 Add to Home Screen
        </button>
        
        <button className="pwa-dismiss" onClick={onDismiss}>
          Not now
        </button>
      </motion.div>
    </motion.div>
  );
};
```

### iOS Safari Fallback

Since iOS doesn't support the `beforeinstallprompt` API, show manual instructions:

```tsx
const IOSInstallGuide: React.FC = () => (
  <div className="ios-guide">
    <p className="ios-step">1. Tap the <strong>Share</strong> button 📤</p>
    <p className="ios-step">2. Scroll down and tap <strong>Add to Home Screen</strong></p>
    <p className="ios-step">3. Tap <strong>Add</strong> in the top right</p>
  </div>
);
```

```css
.ios-guide {
  background: var(--bg-card);
  border-radius: 12px;
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.ios-step {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--border-subtle);
}

.ios-step:last-child {
  border-bottom: none;
}

.ios-step strong {
  color: var(--text-primary);
}
```

### Offline Behavior

When installed as PWA and offline:

```
┌─────────────────────────────────────────┐
│                                         │
│                 📡                      │
│                                         │
│          You're offline                 │
│                                         │
│    No worries — your data is saved      │
│    locally. Add expenses and they'll    │
│    sync when you're back online.        │
│                                         │
│        ┌───────────────────┐            │
│        │  + Add Expense    │            │  ← Still works offline
│        └───────────────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

### PWA Manifest Updates

```json
{
  "name": "SpendBot — Expense Tracker",
  "short_name": "SpendBot",
  "description": "Track spending in seconds. $4.99 once, yours forever.",
  "theme_color": "#08080C",
  "background_color": "#08080C",
  "display": "standalone",
  "orientation": "portrait",
  "categories": ["finance", "productivity"],
  "screenshots": [
    { "src": "/screenshots/dashboard.png", "sizes": "390x844", "type": "image/png", "label": "Dashboard" },
    { "src": "/screenshots/add-expense.png", "sizes": "390x844", "type": "image/png", "label": "Add Expense" }
  ]
}
```

### Settings Integration

When PWA is not installed, show in Settings:

```
│  📲  Install App                    →  │  ← Opens install modal
│      Get the full app experience       │
```

When already installed:
```
│  ✅  App Installed                     │  ← Non-clickable, green text
│      You're using the full experience  │
```

---

## 7. ERROR + EMPTY STATES

### Empty State: No Expenses

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                                         │
│                 📭                      │  ← Large icon
│                                         │
│          No expenses yet                │  ← Headline
│                                         │
│    Tap the + button below to            │  ← Subtext
│    add your first expense               │
│                                         │
│        ┌───────────────────┐            │
│        │  + Add Expense    │            │  ← Optional CTA
│        └───────────────────┘            │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

### Empty State: No Budget Set

```
┌─────────────────────────────────────────┐
│                                         │
│                 💡                      │
│                                         │
│          Set a monthly budget           │
│                                         │
│    Track your progress and see          │
│    how you're doing                     │
│                                         │
│        ┌───────────────────┐            │
│        │  Set Budget       │            │
│        └───────────────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

---

### Error State: Network Error

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                 📡                      │
│                                         │
│        Connection lost                  │
│                                         │
│    We couldn't reach our servers.       │
│    Check your connection and            │
│    try again.                           │
│                                         │
│        ┌───────────────────┐            │
│        │  Retry            │            │
│        └───────────────────┘            │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

### Error State: Generic Error

```
┌─────────────────────────────────────────┐
│                                         │
│                 😵                      │
│                                         │
│        Something went wrong             │
│                                         │
│    We hit a snag. Don't worry,          │
│    your data is safe.                   │
│                                         │
│        ┌───────────────────┐            │
│        │  Try Again        │            │
│        └───────────────────┘            │
│                                         │
│        Contact Support                  │  ← Link
│                                         │
└─────────────────────────────────────────┘
```

---

### CSS Specs

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  min-height: 300px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  opacity: 0.8;
}

.empty-headline {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-subtext {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  max-width: 260px;
  margin-bottom: var(--space-5);
  line-height: 1.5;
}

.empty-action {
  padding: var(--space-3) var(--space-5);
  background: var(--accent);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: white;
}

/* Error states */
.error-state {
  background: rgba(239, 68, 68, 0.1);
  border-radius: 16px;
  margin: var(--space-4);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--space-3);
}

.error-headline {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--error);
  margin-bottom: var(--space-2);
}

.support-link {
  font-size: 0.875rem;
  color: var(--accent);
  margin-top: var(--space-4);
}
```

---

### Component Structure

```tsx
interface EmptyStateProps {
  icon: string;
  headline: string;
  subtext: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon, headline, subtext, actionLabel, onAction
}) => (
  <div className="empty-state">
    <motion.span 
      className="empty-icon"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {icon}
    </motion.span>
    <h3 className="empty-headline">{headline}</h3>
    <p className="empty-subtext">{subtext}</p>
    {actionLabel && onAction && (
      <button className="empty-action" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

// Preset configurations
const EmptyStates = {
  noExpenses: (onAdd: () => void) => (
    <EmptyState
      icon="📭"
      headline="No expenses yet"
      subtext="Tap the + button below to add your first expense"
      actionLabel="+ Add Expense"
      onAction={onAdd}
    />
  ),
  
  noBudget: (onSet: () => void) => (
    <EmptyState
      icon="💡"
      headline="Set a monthly budget"
      subtext="Track your progress and see how you're doing"
      actionLabel="Set Budget"
      onAction={onSet}
    />
  ),
  
  networkError: (onRetry: () => void) => (
    <EmptyState
      icon="📡"
      headline="Connection lost"
      subtext="We couldn't reach our servers. Check your connection and try again."
      actionLabel="Retry"
      onAction={onRetry}
    />
  ),
  
  genericError: (onRetry: () => void) => (
    <div className="error-state">
      <EmptyState
        icon="😵"
        headline="Something went wrong"
        subtext="We hit a snag. Don't worry, your data is safe."
        actionLabel="Try Again"
        onAction={onRetry}
      />
      <a href="mailto:support@spendbot.app" className="support-link">
        Contact Support
      </a>
    </div>
  ),
};
```

---

## Implementation Priority

### P0 — This Week
1. Design token alignment (update CSS vars to match this spec)
2. Dashboard 3-zone layout simplification
3. Settings screen completion (account, data, support sections)
4. Error/empty states

### P1 — Next Week
5. Onboarding with phone mockups
6. Add Expense polish (quick suggestions, digit animations)
7. Paywall optimization (testimonial, comparison table)
8. PWA install modal

### P2 — Backlog
9. History search/filters
10. CSV export
11. iOS Safari install guide
12. Offline mode banner

---

## File Summary

| Component | Priority | Key Changes |
|-----------|----------|-------------|
| Design tokens | Foundation | Align to indigo accent, add category colors, font stacks |
| Onboarding (3 screens) | P1 | Phone mockups, differentiated copy, progress dots |
| Dashboard (3 zones) | P0 | Simplify from 10+ sections → Hero + Stats + Recent |
| Add Expense | P1 | Quick suggestions, digit animation, category fade edges |
| Settings | P0 | Add Account, Data, Support sections; category spend totals |
| Payment/Upgrade | P1 | Testimonial, Free vs Premium table, pulse CTA |
| PWA Install | P1 | Full modal with benefits, iOS fallback, settings integration |
| Error/Empty States | P0 | 4 variants: no expenses, no budget, network error, generic |

---

## Appendix A: Loading State

The current "Waking up the robot..." loading screen is charming — keep it, but add a subtle progress indicator:

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                 🤖                      │  ← Robot (existing)
│                                         │
│       Waking up the robot...            │  ← Keep copy
│                                         │
│          ━━━━━━━━━━━━━━                 │  ← Add shimmer bar
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

```css
.loading-bar {
  width: 120px;
  height: 3px;
  background: var(--bg-elevated);
  border-radius: 2px;
  margin: var(--space-4) auto 0;
  overflow: hidden;
}

.loading-bar::after {
  content: '';
  display: block;
  width: 40%;
  height: 100%;
  background: var(--gradient-accent);
  border-radius: 2px;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

## Appendix B: Border Radii Reference

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Small chips, badges |
| `rounded-xl` | 12px | Input fields, small cards |
| `rounded-2xl` | 16px | Cards, buttons, number pad |
| `rounded-3xl` | 24px | Bottom sheets, modals |
| `rounded-4xl` | 32px | Phone mockups |

---

## Appendix C: Touch Target Minimums

All interactive elements must be **minimum 44×44px** tap target (per Apple HIG). Current compliance is good — maintain this.

For number pad buttons: **72px height** (generous, per spec above).
For header icons: **40×40px** visible, **44×44px** hit area (add padding if needed).

---

*Redesign spec v2.0 complete. All 6 screens + design system + appendices. Ready for implementation.*
