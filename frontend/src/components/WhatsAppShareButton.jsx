import { FiShare2 } from 'react-icons/fi';
import { shareToWhatsApp } from '../utils/whatsappShare';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

/**
 * Reusable WhatsApp Share Button Component
 * @param {Object} props
 * @param {string} props.campaignId - Campaign ID
 * @param {string} props.campaignTitle - Campaign title
 * @param {string} props.variant - 'default' | 'icon' | 'compact'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.raisedAmount - Optional raised amount
 * @param {number} props.goalAmount - Optional goal amount
 * @param {number} props.donorCount - Optional donor count
 * @param {boolean} props.isUrgent - Optional urgency flag
 * @param {string} props.category - Optional category
 */
const WhatsAppShareButton = ({ 
  campaignId, 
  campaignTitle, 
  variant = 'default',
  size = 'md',
  className = '',
  raisedAmount = null,
  goalAmount = null,
  donorCount = null,
  isUrgent = false,
  category = null
}) => {
  const { user } = useSelector((state) => state.auth);

  const handleShare = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const userId = user?.id || user?._id;
    shareToWhatsApp({
      campaignId,
      campaignTitle,
      userId: userId || null,
      raisedAmount,
      goalAmount,
      donorCount,
      isUrgent,
      category
    });
    toast.success('Opening WhatsApp...');
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={`bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-110 shadow-md ${sizeClasses[size]} ${className}`}
        title="Share on WhatsApp"
      >
        <FiShare2 className={iconSizes[size]} />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleShare}
        className={`bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-md flex items-center gap-1.5 ${sizeClasses[size]} ${className}`}
      >
        <FiShare2 className={iconSizes[size]} />
        <span className="font-semibold">Share</span>
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={handleShare}
      className={`bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2 font-semibold ${sizeClasses[size]} ${className}`}
    >
      <FiShare2 className={iconSizes[size]} />
      <span>Share on WhatsApp</span>
    </button>
  );
};

export default WhatsAppShareButton;
