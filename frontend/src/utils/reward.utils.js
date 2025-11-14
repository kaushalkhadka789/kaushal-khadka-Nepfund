// Reward system configuration (matching backend)
export const REWARD_CONFIG = {
  POINTS_PER_NPR: 0.1, // 1 point per 10 NPR
  TIERS: {
    Bronze: { name: 'Bronze', minPoints: 0, maxPoints: 999, color: '#cd7f32', icon: '🟤' },
    Silver: { name: 'Silver', minPoints: 1000, maxPoints: 2499, color: '#c0c0c0', icon: '⚪' },
    Gold: { name: 'Gold', minPoints: 2500, maxPoints: 4999, color: '#ffd700', icon: '🟡' },
    Platinum: { name: 'Platinum', minPoints: 5000, maxPoints: Infinity, color: '#e5e4e2', icon: '💎' },
  },
};

/**
 * Get user's current tier based on points
 */
export const getTier = (points) => {
  const tiers = Object.values(REWARD_CONFIG.TIERS);
  for (const tier of tiers) {
    if (points >= tier.minPoints && points <= tier.maxPoints) {
      return tier;
    }
  }
  return REWARD_CONFIG.TIERS.Bronze;
};

