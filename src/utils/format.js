// Format cents to currency string
export function formatCurrency(cents, currency = 'USD') {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format date for display
export function formatDate(date) {
  const d = new Date(date);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === now.toDateString()) {
    return 'Today';
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
}

// Format time for display
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Get current month name
export function getCurrentMonthName() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Group expenses by date
export function groupExpensesByDate(expenses) {
  const groups = {};
  expenses.forEach(expense => {
    const dateKey = new Date(expense.date).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: expense.date,
        dateLabel: formatDate(expense.date),
        expenses: [],
        total: 0
      };
    }
    groups[dateKey].expenses.push(expense);
    groups[dateKey].total += expense.amount;
  });
  return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
}
