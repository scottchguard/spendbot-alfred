import { motion, AnimatePresence } from 'framer-motion';

export function Toast({ show, message, action, onAction, onDismiss }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 z-50"
        >
          <div className="bg-surface-raised border border-border rounded-2xl px-4 py-3 
                          flex items-center justify-between shadow-lg">
            <span className="text-text-primary text-sm">{message}</span>
            {action && (
              <button
                onClick={onAction}
                className="text-accent font-semibold text-sm ml-4 px-3 py-1 
                           bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors"
              >
                {action}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
