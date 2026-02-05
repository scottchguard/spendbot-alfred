import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Animated Robot */}
          <motion.div 
            className="text-8xl mb-6"
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            🤖
          </motion.div>
          
          <h1 className="text-4xl font-heading font-bold text-text-primary mb-3">
            SpendBot
          </h1>
          
          <p className="text-xl text-text-secondary mb-2">
            Track spending in 3 seconds flat
          </p>
          
          <p className="text-text-muted">
            Your friendly robot budgeting buddy
          </p>
        </motion.div>
      </div>

      {/* Features */}
      <div className="px-6 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <FeatureCard 
            emoji="⚡"
            title="Stupid Simple"
            description="Tap, enter amount, done. No categories to set up, no budgets to configure."
          />
          <FeatureCard 
            emoji="🧠"
            title="Smart Insights"
            description="SpendBot learns your patterns and gives you real-time feedback on your spending velocity."
          />
          <FeatureCard 
            emoji="🔒"
            title="Private by Default"
            description="Your data syncs securely to your account. We never sell your information."
          />
          <FeatureCard 
            emoji="💰"
            title="$4.99 Forever"
            description="One payment, lifetime access. No subscriptions, no upsells, no BS."
          />
        </motion.div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-8">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onGetStarted}
          className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-lg
                     shadow-lg shadow-accent/25 active:scale-[0.98] transition-transform"
        >
          Get Started Free
        </motion.button>
        
        <p className="text-center text-text-muted text-sm mt-4">
          Free for your first 50 expenses • No credit card required
        </p>
      </div>

      {/* Social Proof */}
      <div className="px-6 pb-12">
        <div className="bg-surface-raised rounded-2xl p-6 text-center">
          <div className="flex justify-center gap-1 mb-2">
            {[1,2,3,4,5].map(i => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
          </div>
          <p className="text-text-secondary italic mb-2">
            "Finally, an expense tracker that doesn't feel like homework."
          </p>
          <p className="text-text-muted text-sm">— Happy Human</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-8 text-center">
        <div className="flex justify-center gap-6 text-sm">
          <Link 
            to="/privacy"
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms"
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            Terms of Service
          </Link>
          <a 
            href="mailto:support@spendbot.app"
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            Contact
          </a>
        </div>
        <p className="text-text-muted text-xs mt-4">
          © 2026 SpendBot. Made with 🤖 in Austin, TX.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ emoji, title, description }) {
  return (
    <div className="bg-surface-raised rounded-xl p-4 flex gap-4">
      <div className="text-2xl">{emoji}</div>
      <div>
        <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>
    </div>
  );
}
