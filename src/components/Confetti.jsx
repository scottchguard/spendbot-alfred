import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#6366F1', '#A855F7', '#EC4899', '#F97316', '#22C55E', '#3B82F6'];
const EMOJIS = ['💰', '✨', '🎉', '💸', '🤑', '⭐'];

function Particle({ x, emoji, delay, color }) {
  const endX = x + (Math.random() - 0.5) * 200;
  const endY = -window.innerHeight - 100;
  const rotation = Math.random() * 720 - 360;
  
  return (
    <motion.div
      initial={{ 
        x, 
        y: window.innerHeight / 2,
        opacity: 1,
        scale: 0,
        rotate: 0
      }}
      animate={{ 
        x: endX,
        y: endY,
        opacity: [1, 1, 0],
        scale: [0, 1.5, 1],
        rotate: rotation
      }}
      transition={{ 
        duration: 1.5 + Math.random() * 0.5,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="fixed text-2xl pointer-events-none z-50"
      style={{ color }}
    >
      {emoji ? emoji : '●'}
    </motion.div>
  );
}

export function Confetti({ show, emoji }) {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (show) {
      const newParticles = [];
      const centerX = window.innerWidth / 2;
      
      // Create burst of particles
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: centerX + (Math.random() - 0.5) * 100,
          emoji: i < 5 ? emoji : (Math.random() > 0.5 ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null),
          delay: Math.random() * 0.2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
      
      setParticles(newParticles);
      
      // Clear after animation
      const timer = setTimeout(() => setParticles([]), 2500);
      return () => clearTimeout(timer);
    }
  }, [show, emoji]);
  
  return (
    <AnimatePresence>
      {particles.map(particle => (
        <Particle key={particle.id} {...particle} />
      ))}
    </AnimatePresence>
  );
}

// Simple success checkmark with ring animation
export function SuccessCheck({ category }) {
  return (
    <motion.div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-full border-4 border-success"
          style={{ width: 100, height: 100 }}
        />
        
        {/* Inner glow */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-[100px] h-[100px] rounded-full bg-success/20 flex items-center justify-center"
        >
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2 
            }}
            className="text-5xl"
          >
            {category?.emoji || '✓'}
          </motion.span>
        </motion.div>
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-success font-semibold text-lg"
      >
        Expense Added!
      </motion.p>
    </motion.div>
  );
}
