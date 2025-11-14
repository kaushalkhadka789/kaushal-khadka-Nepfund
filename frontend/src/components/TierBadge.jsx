import { motion } from 'framer-motion';

const TIER_CONFIG = {
  Bronze: { color: '#cd7f32', icon: '🟤', glow: '#cd7f3280' },
  Silver: { color: '#c0c0c0', icon: '⚪', glow: '#c0c0c080' },
  Gold: { color: '#ffd700', icon: '🟡', glow: '#ffd70080' },
  Platinum: { color: '#e5e4e2', icon: '💎', glow: '#e5e4e280' },
};

const TierBadge = ({ tier, size = 'md', showIcon = true, className = '' }) => {
  if (!tier || !TIER_CONFIG[tier.name]) {
    return null;
  }

  const config = TIER_CONFIG[tier.name];
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold shadow-md ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: config.color,
        color: tier.name === 'Gold' || tier.name === 'Silver' ? '#000' : '#fff',
        boxShadow: `0 0 10px ${config.glow}, 0 2px 4px rgba(0,0,0,0.2)`,
      }}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{tier.name}</span>
    </motion.div>
  );
};

export default TierBadge;

