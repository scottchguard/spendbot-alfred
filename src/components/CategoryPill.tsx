import { motion } from 'framer-motion';

interface CategoryPillProps {
  emoji: string;
  name: string;
  amount: string;
  color: string;
}

export default function CategoryPill({ emoji, name, amount, color }: CategoryPillProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-raised shrink-0"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <span className="text-lg">{emoji}</span>
      <div className="flex flex-col">
        <span className="text-xs text-text-muted">{name}</span>
        <span className="text-sm font-semibold text-text-primary">{amount}</span>
      </div>
    </motion.div>
  );
}
