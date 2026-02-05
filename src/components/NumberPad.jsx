import { motion } from 'framer-motion';

const buttons = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫']
];

// Get accessible label for each button
function getButtonLabel(btn) {
  if (btn === '⌫') return 'Delete';
  if (btn === '.') return 'Decimal point';
  return btn;
}

export function NumberPad({ onInput, onDelete }) {
  const handlePress = (value) => {
    if (value === '⌫') {
      onDelete();
    } else {
      onInput(value);
    }
  };

  return (
    <div 
      className="grid grid-cols-3 gap-3 px-6 pb-4"
      role="group"
      aria-label="Number pad"
    >
      {buttons.flat().map((btn) => (
        <motion.button
          key={btn}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={() => handlePress(btn)}
          aria-label={getButtonLabel(btn)}
          className={`
            h-16 rounded-2xl text-2xl font-medium
            ${btn === '⌫' ? 'bg-surface text-text-secondary' : 'bg-surface-raised text-text-primary'}
            active:bg-border transition-colors duration-150
            flex items-center justify-center
          `}
        >
          {btn}
        </motion.button>
      ))}
    </div>
  );
}
