// Default expense categories
// Top 5: most frequently used, then alphabetical, "Other" always last
export const DEFAULT_CATEGORIES = [
  // Top 5 most used
  { id: 'food', name: 'Food', emoji: '🍔', color: '#F97316', isDefault: true, sortOrder: 0 },
  { id: 'coffee', name: 'Coffee', emoji: '☕', color: '#92400E', isDefault: true, sortOrder: 1 },
  { id: 'transport', name: 'Transport', emoji: '🚗', color: '#3B82F6', isDefault: true, sortOrder: 2 },
  { id: 'groceries', name: 'Groceries', emoji: '🛒', color: '#22C55E', isDefault: true, sortOrder: 3 },
  { id: 'drinks', name: 'Drinks', emoji: '🍺', color: '#F59E0B', isDefault: true, sortOrder: 4 },
  // Alphabetical from here
  { id: 'bills', name: 'Bills', emoji: '🏠', color: '#6B7280', isDefault: true, sortOrder: 5 },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬', color: '#A855F7', isDefault: true, sortOrder: 6 },
  { id: 'gifts', name: 'Gifts', emoji: '🎁', color: '#E11D48', isDefault: true, sortOrder: 7 },
  { id: 'health', name: 'Health', emoji: '💊', color: '#EF4444', isDefault: true, sortOrder: 8 },
  { id: 'kids', name: 'Kids', emoji: '👶', color: '#38BDF8', isDefault: true, sortOrder: 9 },
  { id: 'personal-care', name: 'Personal Care', emoji: '💅', color: '#F472B6', isDefault: true, sortOrder: 10 },
  { id: 'pets', name: 'Pets', emoji: '🐕', color: '#A3E635', isDefault: true, sortOrder: 11 },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#EC4899', isDefault: true, sortOrder: 12 },
  { id: 'subscriptions', name: 'Subscriptions', emoji: '📱', color: '#6366F1', isDefault: true, sortOrder: 13 },
  { id: 'travel', name: 'Travel', emoji: '✈️', color: '#06B6D4', isDefault: true, sortOrder: 14 },
  // Other always last
  { id: 'other', name: 'Other', emoji: '📦', color: '#64748B', isDefault: true, sortOrder: 99 },
];

// Helper to get category by ID
export function getCategoryById(id) {
  return DEFAULT_CATEGORIES.find(c => c.id === id) || DEFAULT_CATEGORIES.find(c => c.id === 'other');
}
