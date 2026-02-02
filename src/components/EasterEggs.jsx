import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Easter Eggs - Secret fun stuff hidden in the app
 * 
 * Because apps should have secrets.
 */

// Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 
  'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 
  'ArrowLeft', 'ArrowRight', 
  'b', 'a'
];

// Secret swipe pattern (for mobile): up up down down left right left right
const SWIPE_PATTERN = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'];

// Hook to detect Konami code
export function useKonamiCode(callback) {
  const [inputSequence, setInputSequence] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      setInputSequence(prev => {
        const newSequence = [...prev, e.key === ' ' ? 'Space' : (e.key.startsWith('Arrow') ? e.key : key)];
        
        // Keep only the last N keys where N is the length of the code
        if (newSequence.length > KONAMI_CODE.length) {
          newSequence.shift();
        }
        
        // Check if sequence matches
        if (newSequence.length === KONAMI_CODE.length) {
          const matches = newSequence.every((key, i) => 
            key.toLowerCase() === KONAMI_CODE[i].toLowerCase()
          );
          if (matches) {
            callback();
            return [];
          }
        }
        
        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);

  return inputSequence;
}

// Secret shake detection for mobile
export function useShakeDetection(callback, threshold = 15) {
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let shakeCount = 0;
    let lastShake = 0;

    const handleMotion = (e) => {
      const { x, y, z } = e.accelerationIncludingGravity || {};
      if (x === undefined) return;

      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if ((deltaX > threshold && deltaY > threshold) || 
          (deltaX > threshold && deltaZ > threshold) || 
          (deltaY > threshold && deltaZ > threshold)) {
        const now = Date.now();
        if (now - lastShake > 300) {
          shakeCount++;
          lastShake = now;
          
          if (shakeCount >= 5) {
            callback();
            shakeCount = 0;
          }
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, [callback, threshold]);
}

// Konami Code Easter Egg Modal
export function KonamiEasterEgg({ show, onClose }) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-3xl p-8 max-w-sm text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.2, 1, 1.2, 1]
            }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-7xl mb-4"
          >
            🎮
          </motion.div>
          
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            KONAMI CODE ACTIVATED!
          </h2>
          
          <p className="text-text-secondary mb-4">
            You found the secret! You're clearly a person of culture.
          </p>

          <div className="bg-black/30 rounded-xl p-4 mb-4">
            <p className="text-xs text-text-muted mb-2">You unlocked:</p>
            <p className="text-lg font-mono text-yellow-400">
              +30 LIVES
            </p>
            <p className="text-xs text-text-muted mt-2">
              (Just kidding. But you DO get bragging rights.)
            </p>
          </div>

          <div className="text-4xl mb-4">
            🕹️ ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️
          </div>

          <p className="text-xs text-text-muted italic">
            "The code that launched a thousand cheats"
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-yellow-500/30 rounded-xl text-yellow-200 font-medium"
          >
            Nice! 🎉
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Shake Easter Egg (mobile)
export function ShakeEasterEgg({ show, onClose }) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl p-8 max-w-sm text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            animate={{ rotate: [0, -20, 20, -20, 20, 0] }}
            transition={{ duration: 0.5 }}
            className="text-7xl mb-4"
          >
            📱
          </motion.div>
          
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            SHAKE IT OFF!
          </h2>
          
          <p className="text-text-secondary mb-4">
            You shook your phone like you were trying to shake off that impulse purchase.
          </p>

          <p className="text-lg text-purple-300 mb-4">
            Achievement: Phone Shaker 📳
          </p>

          <p className="text-xs text-text-muted italic">
            "Shake it like your savings depend on it"
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-purple-500/30 rounded-xl text-purple-200 font-medium"
          >
            Haha! 😄
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Secret tap zone (invisible, triggers on 7 taps)
export function SecretTapZone({ children, onSecret }) {
  const [tapCount, setTapCount] = useState(0);
  const [lastTap, setLastTap] = useState(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap > 2000) {
      // Reset if too slow
      setTapCount(1);
    } else {
      setTapCount(prev => prev + 1);
    }
    setLastTap(now);

    if (tapCount >= 6) {
      onSecret?.();
      setTapCount(0);
    }
  }, [tapCount, lastTap, onSecret]);

  return (
    <div onClick={handleTap}>
      {children}
    </div>
  );
}

// Fun loading messages
export const LOADING_MESSAGES = [
  "Counting your pennies...",
  "Consulting the financial spirits...",
  "Asking your wallet for permission...",
  "Crunching numbers (om nom nom)...",
  "Summoning the budget gods...",
  "Teaching robots about money...",
  "Calculating your life choices...",
  "Loading financial wisdom...",
  "Preparing your money facts...",
  "Analyzing spending patterns...",
  "Warming up the calculator...",
  "Fetching your data from the cloud ☁️",
  "Making math happen...",
  "Organizing your receipts...",
  "Converting caffeine to code...",
  "Asking AI for spare change...",
  "Reticulating splines... (jk, counting money)",
  "Loading... almost... there...",
  "Your patience is appreciated 🙏",
  "Good things come to those who wait!",
];

export function getRandomLoadingMessage() {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}

// Fun loading component
export function FunLoader({ message }) {
  const [currentMessage, setCurrentMessage] = useState(message || getRandomLoadingMessage());

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setCurrentMessage(getRandomLoadingMessage());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [message]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="text-4xl mb-4"
      >
        🤖
      </motion.div>
      <motion.p
        key={currentMessage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-text-muted text-sm text-center"
      >
        {currentMessage}
      </motion.p>
    </div>
  );
}

// "Are you sure?" dramatic confirmation
export function DramaticConfirm({ show, amount, onConfirm, onCancel }) {
  if (!show) return null;

  const isDramatic = amount >= 10000; // Over $100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className={`rounded-3xl p-6 max-w-sm text-center ${
            isDramatic 
              ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30' 
              : 'bg-surface-raised'
          }`}
        >
          <motion.div
            animate={isDramatic ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: isDramatic ? Infinity : 0 }}
            className="text-5xl mb-4"
          >
            {isDramatic ? '😱' : '🤔'}
          </motion.div>

          <h3 className="text-xl font-bold text-text-primary mb-2">
            {isDramatic ? 'HOLD UP!' : 'Just checking...'}
          </h3>

          <p className="text-text-secondary mb-4">
            {isDramatic 
              ? `You're about to log $${(amount / 100).toFixed(2)}. That's a chunky one! Are you sure?`
              : 'Ready to save this expense?'
            }
          </p>

          {isDramatic && (
            <p className="text-xs text-text-muted mb-4 italic">
              (No judgment, just double-checking! 💜)
            </p>
          )}

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="flex-1 py-3 bg-surface-raised rounded-xl text-text-secondary"
            >
              Wait, no
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              className={`flex-1 py-3 rounded-xl text-white ${
                isDramatic ? 'bg-red-500' : 'bg-accent'
              }`}
            >
              {isDramatic ? 'YOLO' : 'Yes!'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
