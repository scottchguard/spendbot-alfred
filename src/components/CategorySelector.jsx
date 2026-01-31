import { motion } from 'framer-motion';

export function CategorySelector({ categories, selected, onSelect }) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 px-6 pb-2">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, type: 'spring', stiffness: 300 }}
            onClick={() => onSelect(cat)}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-2xl min-w-[72px]
              transition-all duration-200
              ${selected?.id === cat.id 
                ? 'bg-accent/20 ring-2 ring-accent' 
                : 'bg-surface-raised hover:bg-border'}
            `}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-xs text-text-secondary font-medium">{cat.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
