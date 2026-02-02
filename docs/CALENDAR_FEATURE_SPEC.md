# 📅 SpendBot Calendar Feature Spec
*"See your spending history at a glance"*

---

## Overview
A heat map calendar that visualizes daily spending with color intensity. Tap any day to drill into expenses. Makes spending patterns obvious and adds gamification opportunities.

---

## User Flow

```
Dashboard → Tap Calendar Icon (📅) → Calendar View
                                          ↓
                                    Month Grid View
                                    (color-coded days)
                                          ↓
                                    Tap a Day
                                          ↓
                                    Day Detail Modal
                                    (list of expenses)
```

---

## Components

### 1. CalendarView (Main Screen)

**Header:**
- Month/Year title (e.g., "February 2026")
- Left/Right arrows to navigate months
- "Today" button to jump back to current month
- Close button (X) to return to dashboard

**Calendar Grid:**
- 7 columns (S M T W T F S)
- 5-6 rows depending on month
- Each day cell shows:
  - Day number (1-31)
  - Background color based on spending
  - Small total if > $0 (e.g., "$42")

**Color Scale (Heat Map):**
```
$0           → 🟢 Green (soft, celebrating)
< 25% budget → 🟢 Light green
25-50%       → 🟡 Yellow
50-75%       → 🟠 Orange  
75-100%      → 🔴 Light red
> 100%       → 🔴 Deep red (uh oh)
```

*If no budget set: scale based on user's average daily spend*

**Month Summary Bar (bottom):**
- Total spent this month
- Average per day
- Best day (lowest) / Worst day (highest)
- Robot commentary based on the month

**Robot Commentary Examples (Month Level):**
- Mostly green: "Look at you being all responsible! 💚"
- Mostly red: "This month was... a journey. We'll do better."
- Mixed: "A tale of two budgets. Some highs, some lows."
- Current month, doing well: "You're crushing it so far!"
- Past month, over budget: "What happened here? Actually, don't tell me."

---

### 2. DayDetailModal (Slide-up on tap)

**Header:**
- Date (e.g., "Friday, Feb 14")
- Day total (e.g., "$127.50")
- Number of transactions

**Robot Reaction (contextual):**
- $0 day: "A zero day! Your future self thanks you. 🙏"
- Low spend: "Responsible! I like it."
- Medium: "Pretty normal day. Nothing to see here."
- High spend: "Whew. Big spender energy."
- Massive: "I have concerns but I'm not your mom."

**Expense List:**
- Same format as History view
- Category emoji + name
- Amount
- Tap to edit/delete (future feature)

**Empty State (no expenses):**
- "No expenses recorded"
- Robot: "A clean slate! Or you forgot to log. No judgment."

---

### 3. Visual Design

**Calendar Cell States:**
```
┌─────────┐
│    5    │  ← Day number (top)
│  $42    │  ← Total (center, smaller)
│ ● ● ●   │  ← Transaction dots (optional, max 3)
└─────────┘
    ↑
 Background color = heat map intensity
```

**Today Indicator:**
- Ring/border around today's cell
- Subtle pulse animation

**Selected Day:**
- Scale up slightly (1.05x)
- Stronger border
- Haptic feedback on tap

**Future Days:**
- Grayed out / disabled
- No tap action

**Days from Other Months:**
- Very faint, different color
- Shows continuity but clearly "not this month"

---

## Animations

1. **Month Transition:**
   - Swipe left = next month (slides in from right)
   - Swipe right = previous month (slides in from left)
   - Arrow tap = same animation

2. **Day Tap:**
   - Cell scales up briefly
   - Modal slides up from bottom
   - Background dims

3. **Color Fade:**
   - When switching months, cells fade in with staggered delay
   - Creates a "filling in" effect

4. **Robot:**
   - Appears in corner of modal
   - Bounces in with message
   - Different expressions based on day's spending

---

## Data Requirements

**From existing hooks:**
- `expenses` array (already have this)
- `settings.monthlyBudget` (already have this)

**New calculations needed:**
```javascript
// Group expenses by date
const expensesByDate = useMemo(() => {
  return expenses.reduce((acc, exp) => {
    const date = exp.date.split('T')[0]; // YYYY-MM-DD
    if (!acc[date]) acc[date] = [];
    acc[date].push(exp);
    return acc;
  }, {});
}, [expenses]);

// Get daily totals
const dailyTotals = useMemo(() => {
  return Object.entries(expensesByDate).reduce((acc, [date, exps]) => {
    acc[date] = exps.reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {});
}, [expensesByDate]);

// Calculate color thresholds
const getColorForAmount = (amount, date) => {
  if (amount === 0) return 'green';
  
  const dailyBudget = settings.monthlyBudget 
    ? settings.monthlyBudget / daysInMonth
    : averageDailySpend;
  
  const percentage = (amount / dailyBudget) * 100;
  
  if (percentage < 25) return 'green-light';
  if (percentage < 50) return 'yellow';
  if (percentage < 75) return 'orange';
  if (percentage < 100) return 'red-light';
  return 'red';
};
```

---

## Entry Point

**Option A: Replace History button**
- History becomes Calendar
- Calendar has a "list view" toggle for old behavior

**Option B: Add Calendar icon to header** ✅ (Recommended)
- Keep existing History as is
- Add 📅 button next to ⚙️ in dashboard header
- Two ways to view past data

**Option C: Tab bar**
- Bottom tabs: Dashboard | Calendar | History | Settings
- More app-like, but bigger change

**Recommendation:** Option B — additive, doesn't break anything, easy to A/B test.

---

## Gamification Opportunities

1. **Streak Counter:**
   - "7 green days in a row! 🔥"
   - Achievement: "Green Week" for 7 consecutive under-budget days

2. **Monthly Challenge:**
   - "Get 20 green days this month"
   - Progress bar at bottom of calendar

3. **No-Spend Highlights:**
   - $0 days get a special ✨ indicator
   - "You had 5 no-spend days this month!"

4. **Pattern Detection:**
   - "You tend to overspend on Fridays"
   - "Weekends are your danger zone"
   - Could show as subtle indicators on day labels

---

## Technical Implementation

**New Files:**
```
src/components/
  CalendarView.jsx       # Main calendar screen
  CalendarGrid.jsx       # Month grid component
  CalendarDay.jsx        # Individual day cell
  DayDetailModal.jsx     # Expense list for selected day
  CalendarRobot.jsx      # Robot commentary logic
```

**Estimated Complexity:**
- CalendarView: Medium (layout, navigation)
- CalendarGrid: Medium (date math, grid layout)
- CalendarDay: Easy (styled cell)
- DayDetailModal: Easy (reuse History item styles)
- CalendarRobot: Easy (message arrays)

**Date Library:**
- Use native Date APIs (already used elsewhere)
- Or add `date-fns` if math gets complex (lightweight)

---

## Edge Cases

1. **New user, no expenses:** 
   - Show empty calendar
   - Robot: "Nothing here yet! Start tracking to see your patterns."

2. **User with months of history:**
   - Load expenses for visible month only
   - Lazy load when navigating to past months

3. **Expense at 11:59 PM:**
   - Use expense.date field (already stores date)
   - No timezone issues since we use local date

4. **Month with no budget set:**
   - Use average daily spend as baseline
   - Or use absolute scale ($0-50 green, $50-100 yellow, etc.)

5. **Deleted expenses:**
   - Calendar updates reactively (already handled by hooks)

---

## Future Enhancements (v2)

- **Edit expense from calendar** (tap expense in modal → edit)
- **Add expense to past date** (tap empty day → quick add)
- **Export month** (share calendar as image)
- **Compare months** (side-by-side or overlay)
- **Spending predictions** ("At this rate, you'll spend $X this month")
- **Category filter** (show only food expenses on calendar)

---

## Success Metrics

- **Usage:** % of users who open calendar weekly
- **Retention:** Do calendar users retain better?
- **Engagement:** Time spent in calendar view
- **Behavior change:** Do users spend less after seeing red days?

---

## Open Questions for Scott

1. **Entry point:** Option B (add icon) good, or prefer something else?
2. **Color scheme:** Green/yellow/orange/red, or different palette?
3. **Budget basis:** Daily budget from monthly, or let user set daily target?
4. **History view:** Keep separate, or merge into calendar as "list mode"?
5. **Scope:** Build basic version first, or include gamification from start?

---

*Ready to build on your go! 🐝*
