import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * Financial Fortune - Daily "horoscope" for your wallet
 * 
 * Because who doesn't need a robot telling them their 
 * financial destiny based on absolutely nothing scientific?
 */

const FORTUNES = [
  // Positive vibes
  {
    fortune: "Today's energy favors your savings account. The stars say: chill.",
    emoji: "🌟",
    mood: "blessed",
  },
  {
    fortune: "A great deal awaits you. But is it a NEED or a WANT? 🤔",
    emoji: "💫",
    mood: "cautious",
  },
  {
    fortune: "Your financial aura is strong today. Mercury is NOT in retrograde.",
    emoji: "✨",
    mood: "powerful",
  },
  {
    fortune: "The universe whispers: 'Maybe don't buy that.'",
    emoji: "🔮",
    mood: "wise",
  },
  {
    fortune: "Your wallet appreciates you. Be gentle with it today.",
    emoji: "💝",
    mood: "loving",
  },
  {
    fortune: "Today's vibe: main character energy but with a budget.",
    emoji: "👑",
    mood: "iconic",
  },
  {
    fortune: "A surprise expense approaches. But you've got this.",
    emoji: "⚡",
    mood: "prepared",
  },
  {
    fortune: "The cards reveal... you should check your subscriptions.",
    emoji: "🃏",
    mood: "suspicious",
  },
  {
    fortune: "Financial clarity is yours today. Use it wisely, young padawan.",
    emoji: "🧘",
    mood: "zen",
  },
  {
    fortune: "Your budget alignment is *chef's kiss* today.",
    emoji: "👨‍🍳",
    mood: "perfect",
  },
  
  // Chaotic energy
  {
    fortune: "The stars say treat yourself. The budget says maybe don't. Choose wisely.",
    emoji: "🎭",
    mood: "chaotic",
  },
  {
    fortune: "Impulse purchases are calling. Let it go to voicemail.",
    emoji: "📵",
    mood: "strong",
  },
  {
    fortune: "Today you will encounter: unnecessary but delightful things.",
    emoji: "🎪",
    mood: "tempted",
  },
  {
    fortune: "A coffee purchase is in your future. Shocking, I know.",
    emoji: "☕",
    mood: "caffeinated",
  },
  {
    fortune: "Your spending powers are at maximum. Use them for good.",
    emoji: "🦸",
    mood: "heroic",
  },
  {
    fortune: "Beware: late-night online shopping energy detected.",
    emoji: "🌙",
    mood: "warned",
  },
  {
    fortune: "The algorithm knows what you want. Stay strong.",
    emoji: "🤖",
    mood: "targeted",
  },
  {
    fortune: "A food delivery app will test your resolve today.",
    emoji: "🍕",
    mood: "hungry",
  },
  {
    fortune: "Your future self called. They said 'thanks for saving that $20.'",
    emoji: "📞",
    mood: "grateful",
  },
  {
    fortune: "Plot twist: you don't need it. But do you WANT it? Only you know.",
    emoji: "🎬",
    mood: "dramatic",
  },
  
  // Motivational chaos
  {
    fortune: "Today's affirmation: I am more than my Amazon cart.",
    emoji: "🧠",
    mood: "enlightened",
  },
  {
    fortune: "Broke is a mindset. Unfortunately, so is my bank account.",
    emoji: "💭",
    mood: "philosophical",
  },
  {
    fortune: "The vibes are immaculate. The budget? We'll see.",
    emoji: "🌈",
    mood: "hopeful",
  },
  {
    fortune: "You are one 'add to cart' away from a journey of self-discovery.",
    emoji: "🛒",
    mood: "existential",
  },
  {
    fortune: "Manifesting: financial responsibility. Results may vary.",
    emoji: "🙏",
    mood: "manifesting",
  },
  {
    fortune: "The moon is in 'treat yourself' but your bank is in 'please don't.'",
    emoji: "🌕",
    mood: "conflicted",
  },
  {
    fortune: "Your debit card believes in you. Don't let it down.",
    emoji: "💳",
    mood: "trusted",
  },
  {
    fortune: "Today's financial spirit animal: a squirrel hoarding nuts.",
    emoji: "🐿️",
    mood: "saving",
  },
  {
    fortune: "The universe wants you to check your bank balance. Just a feeling.",
    emoji: "👁️",
    mood: "aware",
  },
  {
    fortune: "Abundance is coming. In the meantime, maybe pack a lunch?",
    emoji: "🥪",
    mood: "practical",
  },
];

// Lucky numbers (just for fun)
const generateLuckyNumbers = () => {
  const numbers = [];
  while (numbers.length < 3) {
    const num = Math.floor(Math.random() * 99) + 1;
    if (!numbers.includes(num)) numbers.push(num);
  }
  return numbers.sort((a, b) => a - b);
};

// Get today's fortune (seeded by date so it's consistent for the day)
export function getTodaysFortune() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % FORTUNES.length;
  return {
    ...FORTUNES[index],
    luckyNumbers: generateLuckyNumbers(),
    date: today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
  };
}

// Fortune card component
export function FinancialFortuneCard({ onDismiss }) {
  const [fortune, setFortune] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setFortune(getTodaysFortune());
  }, []);

  if (!fortune) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔮</span>
          <span className="text-sm font-medium text-purple-300">Daily Financial Fortune</span>
        </div>
        <span className="text-xs text-text-muted">{fortune.date}</span>
      </div>

      {!revealed ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRevealed(true)}
          className="w-full py-4 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-200 font-medium"
        >
          ✨ Reveal Your Fortune ✨
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="text-center mb-3">
            <motion.span 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="text-4xl block mb-2"
            >
              {fortune.emoji}
            </motion.span>
            <p className="text-text-primary italic">"{fortune.fortune}"</p>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
            <span>Mood: {fortune.mood}</span>
            <span>•</span>
            <span>Lucky $: {fortune.luckyNumbers.join(', ')}</span>
          </div>
        </motion.div>
      )}

      {revealed && onDismiss && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onDismiss}
          className="w-full mt-3 text-xs text-text-muted hover:text-text-secondary"
        >
          Dismiss
        </motion.button>
      )}
    </motion.div>
  );
}

// Mini fortune (for dashboard)
export function MiniFortuneWidget() {
  const fortune = getTodaysFortune();
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>{fortune.emoji}</span>
      <span className="text-text-muted truncate">{fortune.fortune}</span>
    </div>
  );
}
