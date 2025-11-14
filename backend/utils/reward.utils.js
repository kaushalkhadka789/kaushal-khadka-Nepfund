// Reward system configuration
export const REWARD_CONFIG = {
  // Points per NPR (1 point per NPR 10 donated)
  POINTS_PER_NPR: 0.1, // 1 point per 10 NPR = 0.1 points per NPR
  // Alternative: 1 point per NPR 100 = 0.01 points per NPR
  // POINTS_PER_NPR: 0.01,
  
  // Reward tiers
  TIERS: {
    BRONZE: {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 999,
      color: '#cd7f32',
      icon: '🟤'
    },
    SILVER: {
      name: 'Silver',
      minPoints: 1000,
      maxPoints: 2499,
      color: '#c0c0c0',
      icon: '⚪'
    },
    GOLD: {
      name: 'Gold',
      minPoints: 2500,
      maxPoints: 4999,
      color: '#ffd700',
      icon: '🟡'
    },
    PLATINUM: {
      name: 'Platinum',
      minPoints: 5000,
      maxPoints: Infinity,
      color: '#e5e4e2',
      icon: '💎'
    }
  }
};

/**
 * Calculate points earned from donation amount
 * @param {number} amount - Donation amount in NPR
 * @returns {number} - Points earned
 */
export const calculatePoints = (amount) => {
  return Math.floor(amount * REWARD_CONFIG.POINTS_PER_NPR);
};

/**
 * Get user's current tier based on points
 * @param {number} points - User's total reward points
 * @returns {object} - Tier information
 */
export const getTier = (points) => {
  const tiers = Object.values(REWARD_CONFIG.TIERS);
  
  for (const tier of tiers) {
    if (points >= tier.minPoints && points <= tier.maxPoints) {
      return tier;
    }
  }
  
  // Default to Bronze if points are negative (shouldn't happen)
  return REWARD_CONFIG.TIERS.BRONZE;
};

/**
 * Get next tier information
 * @param {number} points - User's current points
 * @returns {object|null} - Next tier information or null if already at highest tier
 */
export const getNextTier = (points) => {
  const tiers = Object.values(REWARD_CONFIG.TIERS);
  const currentTier = getTier(points);
  
  // Find next tier
  const currentIndex = tiers.findIndex(t => t.name === currentTier.name);
  
  if (currentIndex < tiers.length - 1) {
    return tiers[currentIndex + 1];
  }
  
  return null; // Already at highest tier
};

/**
 * Calculate progress to next tier
 * @param {number} points - User's current points
 * @returns {object} - Progress information
 */
export const getTierProgress = (points) => {
  const currentTier = getTier(points);
  const nextTier = getNextTier(points);
  
  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progress: 100,
      pointsNeeded: 0,
      amountNeeded: 0
    };
  }
  
  const pointsInCurrentTier = points - currentTier.minPoints;
  const pointsNeededForNextTier = nextTier.minPoints - points;
  const totalPointsInTier = currentTier.maxPoints - currentTier.minPoints + 1;
  const progress = Math.min(100, (pointsInCurrentTier / totalPointsInTier) * 100);
  
  // Calculate amount needed in NPR
  const amountNeeded = Math.ceil(pointsNeededForNextTier / REWARD_CONFIG.POINTS_PER_NPR);
  
  return {
    currentTier,
    nextTier,
    progress: Math.max(0, Math.min(100, progress)),
    pointsNeeded: pointsNeededForNextTier,
    amountNeeded
  };
};

/**
 * Format tier badge for display
 * @param {object} tier - Tier object
 * @returns {object} - Formatted tier badge
 */
export const formatTierBadge = (tier) => {
  return {
    name: tier.name,
    color: tier.color,
    icon: tier.icon,
    className: `tier-badge tier-${tier.name.toLowerCase()}`
  };
};

