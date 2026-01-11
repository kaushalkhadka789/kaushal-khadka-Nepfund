import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiStar, FiAward, FiZap } from 'react-icons/fi'; // Or use lucide-react

// --- CONFIGURATION ---
const TIER_STYLES = {
  Bronze: {
    background: 'bg-gradient-to-br from-orange-800 via-orange-600 to-orange-800',
    border: 'border-orange-400/30',
    text: 'text-orange-50',
    icon: FiShield,
    shadow: 'shadow-orange-900/40',
    shimmer: false,
  },
  Silver: {
    background: 'bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400',
    border: 'border-slate-400/50',
    text: 'text-slate-800',
    icon: FiStar,
    shadow: 'shadow-slate-400/40',
    shimmer: true,
  },
  Gold: {
    background: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500',
    border: 'border-yellow-200/60',
    text: 'text-amber-900',
    icon: FiAward,
    shadow: 'shadow-amber-500/40',
    shimmer: true,
  },
  Platinum: {
    background: 'bg-gradient-to-br from-cyan-100 via-white to-cyan-200',
    border: 'border-cyan-100/80',
    text: 'text-cyan-900',
    icon: FiZap,
    shadow: 'shadow-cyan-400/40',
    shimmer: true,
    sparkles: true,
  },
};

const SIZES = {
  sm: { padding: 'px-2 py-0.5', fontSize: 'text-[10px]', iconSize: 12 },
  md: { padding: 'px-3 py-1', fontSize: 'text-xs', iconSize: 14 },
  lg: { padding: 'px-4 py-1.5', fontSize: 'text-sm', iconSize: 16 },
};

const TierBadge = ({ tier, size = 'md', showIcon = true, className = '' }) => {
  if (!tier || !TIER_STYLES[tier.name]) return null;

  const style = TIER_STYLES[tier.name];
  const sizeConfig = SIZES[size] || SIZES.md;
  const IconComponent = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative overflow-hidden inline-flex items-center gap-1.5 
        rounded-full font-bold uppercase tracking-wide shadow-lg backdrop-blur-sm border
        ${style.background} ${style.border} ${style.text} ${style.shadow} ${sizeConfig.padding} ${className}
      `}
    >
      {/* --- SHIMMER EFFECT (For Silver+) --- */}
      {style.shimmer && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            ease: 'linear',
            repeatDelay: 1,
          }}
          className="absolute inset-0 w-full h-full -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"
        />
      )}

      {/* --- PLATINUM SPARKLES --- */}
      {style.sparkles && (
        <>
          <Sparkle delay={0} x={10} y={20} />
          <Sparkle delay={1.5} x={80} y={10} />
        </>
      )}

      {/* --- CONTENT --- */}
      <div className="relative z-20 flex items-center gap-1.5">
        {showIcon && (
          <IconComponent 
            size={sizeConfig.iconSize} 
            className={tier.name === 'Platinum' ? 'text-cyan-600' : 'fill-current opacity-80'} 
          />
        )}
        <span className={sizeConfig.fontSize}>{tier.name}</span>
      </div>
    </motion.div>
  );
};

// Sub-component for little twinkling stars
const Sparkle = ({ delay, x, y }) => (
  <motion.div
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay: delay,
      ease: 'easeInOut',
    }}
    style={{ left: `${x}%`, top: `${y}%` }}
    className="absolute w-2 h-2 text-white pointer-events-none z-20"
  >
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow-sm">
      <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
    </svg>
  </motion.div>
);

export default TierBadge;