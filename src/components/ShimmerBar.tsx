import { motion } from 'framer-motion';

export default function ShimmerBar() {
  return (
    <motion.div
      className="shimmer-bar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}
