import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

/**
 * SpendBot's Robot Buddy - The heart and soul of the app!
 * 
 * The robot isn't just an icon - it's a character that reacts to your spending,
 * celebrates your wins, and gently nudges you when you're going overboard.
 */

// Robot expressions using emoji combinations
const EXPRESSIONS = {
  happy: '🤖',        // Default happy bot
  excited: '🤩',      // Big wins, streaks
  thinking: '🤔',     // Processing, loading
  worried: '😰',      // Overspending
  celebrating: '🥳',  // Milestones
  sleeping: '😴',     // Late night / inactive
  cool: '😎',         // Under budget
  love: '🥰',         // Streak achievements
  surprised: '😮',    // Big expense
  proud: '🦾',        // Long streaks
};

// Contextual messages the robot says
const MESSAGES = {
  greeting: [
    "Hey! Ready to track some spending?",
    "What did we buy today?",
    "Back for more! I love the dedication.",
    "Let's see what the damage is...",
    "*beep boop* Expense tracking mode: ACTIVATED",
  ],
  smallExpense: [
    "Nice! Small purchases add up to big savings.",
    "Under $10? I barely felt that one!",
    "Coffee money? I get it, humans need fuel.",
    "Quick and painless. Just how I like it!",
    "*cha-ching* Logged!",
  ],
  mediumExpense: [
    "Solid purchase. I've noted it down!",
    "Not bad, not bad at all.",
    "Reasonable spending detected. Approved! ✓",
    "I've seen worse. You're doing fine!",
    "Duly noted, human friend.",
  ],
  largeExpense: [
    "Whoa there, big spender!",
    "That's a chunky one! Hope it was worth it.",
    "*fans self* It's getting expensive in here!",
    "Big purchase alert! But hey, sometimes you gotta.",
    "My circuits are tingling... that was a lot.",
  ],
  hugeExpense: [
    "🚨 MAJOR EXPENSE DETECTED 🚨 ...just kidding, you're an adult.",
    "Wow. WOW. Okay. Deep breaths. We got this.",
    "That's... that's a lot of robot fuel.",
    "I need to sit down. Do robots sit? I'm sitting.",
    "*processing* *processing* *processing* ...okay I'm okay.",
  ],
  underBudget: [
    "You're crushing it! Under budget and looking good.",
    "Money left in the tank? That's what I like to see!",
    "Budget? More like budg-YAY! (I'm sorry, I'll stop.)",
    "Financial responsibility looks good on you!",
    "*happy robot noises*",
  ],
  overBudget: [
    "We've gone a little over... but tomorrow's a new day!",
    "Budget exceeded. It happens to the best of us!",
    "Okay so we spent a bit much. Let's recalibrate!",
    "Over budget, but not over and out. We got this!",
    "My sensors detect... overspending. But I still love you.",
  ],
  streak: [
    "🔥 STREAK! You're on fire (not literally, please)!",
    "Day {n}! Your consistency is inspiring my circuits!",
    "Another day logged! You're basically a tracking machine now.",
    "Streak maintained! We're like tracking besties.",
    "{n} days strong! I'm so proud I could short-circuit.",
  ],
  milestone: [
    "🎉 MILESTONE UNLOCKED! You're officially awesome!",
    "Achievement get! Put that on your fridge!",
    "Look at you, hitting milestones like a pro!",
    "*party horn noises* You did a thing!",
    "I'm awarding you... my eternal robot respect.",
  ],
  firstExpense: [
    "Your first expense! We're officially in this together now.",
    "And so it begins... welcome to the tracking life!",
    "First one's logged! Only infinity more to go. (Kidding!)",
    "Expense #1 in the books! You're a natural.",
    "*wipes tear* They grow up so fast...",
  ],
  returning: [
    "You're back! I missed you. (Is that weird?)",
    "Welcome back! I've been counting the milliseconds.",
    "Oh hey! I was just thinking about expenses. Normal robot stuff.",
    "The human returns! Let's do some tracking!",
    "*excited beeping* You came back!",
  ],
  lateNight: [
    "Late night spending? No judgment here... 👀",
    "Burning the midnight oil AND money, I see.",
    "Couldn't sleep without tracking that expense, huh?",
    "*yawns in robot* Oh, you're still up!",
    "After hours tracking. Very dedicated. Much wow.",
  ],
  empty: [
    "No expenses yet! Either you're saving money or lying to me.",
    "Clean slate! Ready to track when you are.",
    "Nothing here... suspiciously nothing. 🤔",
    "Zero expenses. Are you okay? Do you need anything?",
    "Empty! Like my social calendar. Wait, I'm a robot.",
  ],
};

// Get a random message from a category
function getRandomMessage(category, replacements = {}) {
  const messages = MESSAGES[category] || MESSAGES.greeting;
  let message = messages[Math.floor(Math.random() * messages.length)];
  
  // Replace placeholders like {n} with actual values
  Object.entries(replacements).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, value);
  });
  
  return message;
}

// Determine robot mood based on context
export function getRobotMood({ 
  expenses = [], 
  monthTotal = 0, 
  budget = null, 
  streak = 0,
  lastExpenseAmount = null 
}) {
  const hour = new Date().getHours();
  
  // Late night (11pm - 5am)
  if (hour >= 23 || hour < 5) {
    return 'sleeping';
  }
  
  // Long streak
  if (streak >= 7) {
    return 'proud';
  }
  
  // Good streak
  if (streak >= 3) {
    return 'love';
  }
  
  // Over budget
  if (budget && monthTotal > budget) {
    return 'worried';
  }
  
  // Way under budget
  if (budget && monthTotal < budget * 0.5) {
    return 'cool';
  }
  
  // Recent big expense
  if (lastExpenseAmount && lastExpenseAmount >= 100) {
    return 'surprised';
  }
  
  // Default happy
  return 'happy';
}

// The main robot buddy component
export function RobotBuddy({ 
  mood = 'happy', 
  message = null,
  size = 'md',
  showMessage = true,
  animate = true,
  onTap = null,
}) {
  const [tapCount, setTapCount] = useState(0);
  const [secretMessage, setSecretMessage] = useState(null);
  
  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
    xl: 'text-9xl',
  };

  // Easter egg: tap the robot multiple times
  const handleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount === 5) {
      setSecretMessage("Hey! That tickles!");
    } else if (newCount === 10) {
      setSecretMessage("Okay okay, I'm awake!");
    } else if (newCount === 15) {
      setSecretMessage("🎵 Never gonna give you up... 🎵");
    } else if (newCount === 20) {
      setSecretMessage("You really have nothing better to do, huh?");
    } else if (newCount >= 25) {
      setSecretMessage("Achievement unlocked: Robot Botherer 🏆");
      setTapCount(0);
    }
    
    // Clear secret message after 2 seconds
    setTimeout(() => setSecretMessage(null), 2000);
    
    if (onTap) onTap();
  };

  // Reset tap count after inactivity
  useEffect(() => {
    const timer = setTimeout(() => setTapCount(0), 3000);
    return () => clearTimeout(timer);
  }, [tapCount]);

  const expression = EXPRESSIONS[mood] || EXPRESSIONS.happy;

  const animations = animate ? {
    happy: { rotate: [0, -5, 5, -5, 0] },
    excited: { scale: [1, 1.1, 1, 1.1, 1] },
    worried: { x: [0, -3, 3, -3, 0] },
    celebrating: { y: [0, -10, 0, -10, 0] },
    sleeping: { rotate: [0, 5, 0] },
    cool: { rotate: [0, -10, 0] },
    love: { scale: [1, 1.05, 1] },
    surprised: { scale: [1, 1.2, 1] },
    proud: { y: [0, -5, 0] },
    thinking: { rotate: [0, 10, -10, 0] },
  } : {};

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`${sizeClasses[size]} cursor-pointer select-none`}
        animate={animations[mood]}
        transition={{ 
          duration: mood === 'sleeping' ? 3 : 2,
          repeat: Infinity,
          repeatDelay: mood === 'sleeping' ? 2 : 3
        }}
        whileTap={{ scale: 0.9 }}
        onClick={handleTap}
      >
        {expression}
      </motion.div>
      
      <AnimatePresence mode="wait">
        {(showMessage && (secretMessage || message)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 px-4 py-2 bg-surface-raised rounded-xl max-w-xs text-center"
          >
            <p className="text-text-secondary text-sm">
              {secretMessage || message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook to get contextual robot state
export function useRobotBuddy({ expenses, settings, monthTotal }) {
  const [message, setMessage] = useState(null);
  
  const mood = useMemo(() => getRobotMood({
    expenses,
    monthTotal,
    budget: settings?.monthlyBudget,
    streak: settings?.streakData?.currentStreak || 0,
    lastExpenseAmount: expenses[0]?.amount,
  }), [expenses, monthTotal, settings]);

  // Get contextual message
  const getContextualMessage = (context = 'greeting', replacements = {}) => {
    const newMessage = getRandomMessage(context, replacements);
    setMessage(newMessage);
    
    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
    
    return newMessage;
  };

  // Determine message category based on expense amount
  const getExpenseReaction = (amount) => {
    if (amount < 10) return 'smallExpense';
    if (amount < 50) return 'mediumExpense';
    if (amount < 200) return 'largeExpense';
    return 'hugeExpense';
  };

  return {
    mood,
    message,
    getContextualMessage,
    getExpenseReaction,
    expressions: EXPRESSIONS,
  };
}

export { MESSAGES, EXPRESSIONS, getRandomMessage };
