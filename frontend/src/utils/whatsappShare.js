/**
 * WhatsApp Share Utility
 * Minimal implementation for sharing campaigns via WhatsApp
 */

/**
 * Share campaign to WhatsApp with enhanced message format
 * @param {Object} options - Share options
 * @param {string} options.campaignId - Campaign ID
 * @param {string} options.campaignTitle - Campaign title
 * @param {string} options.userId - Optional user ID for referral tracking
 * @param {string} options.customMessage - Optional custom message
 * @param {number} options.raisedAmount - Optional raised amount
 * @param {number} options.goalAmount - Optional goal amount
 * @param {number} options.donorCount - Optional donor count
 * @param {boolean} options.isUrgent - Optional urgency flag
 * @param {string} options.category - Optional category
 */
export const shareToWhatsApp = ({ 
  campaignId, 
  campaignTitle, 
  userId = null, 
  customMessage = null,
  raisedAmount = null,
  goalAmount = null,
  donorCount = null,
  isUrgent = false,
  category = null
}) => {
  // Build share URL with optional referral parameter
  const baseUrl = window.location.origin;
  const shareUrl = userId 
    ? `${baseUrl}/campaign/${campaignId}?ref=${userId}`
    : `${baseUrl}/campaign/${campaignId}`;

  // If custom message provided, use it
  if (customMessage) {
    const encodedMessage = encodeURIComponent(`${customMessage}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    return;
  }

  // Build enhanced message template
  let message = '';
  
  // Header with urgency indicator
  if (isUrgent) {
    message += '🚨 *URGENT FUNDRAISER* 🚨\n';
    message += '━━━━━━━━━━━━━━━━━━━━\n\n';
  } else {
    message += '💙 *Support This Cause* 💙\n';
    message += '━━━━━━━━━━━━━━━━━━━━\n\n';
  }
  
  // Campaign title
  message += `*${campaignTitle}*\n\n`;
  
  // Category if available
  if (category) {
    message += `📂 ${category}\n\n`;
  }
  
  // Progress details if available
  if (raisedAmount !== null && goalAmount !== null) {
    const progress = Math.round((raisedAmount / goalAmount) * 100);
    const raisedFormatted = raisedAmount.toLocaleString('en-NP');
    const goalFormatted = goalAmount.toLocaleString('en-NP');
    
    message += `💰 *Progress*\n`;
    message += `Raised: रु ${raisedFormatted}\n`;
    message += `Goal: रु ${goalFormatted}\n`;
    message += `Progress: ${progress}%\n`;
    
    if (donorCount !== null && donorCount > 0) {
      message += `👥 ${donorCount} ${donorCount === 1 ? 'donor' : 'donors'}\n`;
    }
    
    message += '\n';
  }
  
  // Call to action
  message += '👉 Help make a difference!\n';
  message += '🙏 Every contribution counts\n\n';
  message += '━━━━━━━━━━━━━━━━━━━━\n\n';
  
  // URL
  message += shareUrl;
  
  // Encode message for WhatsApp
  const encodedMessage = encodeURIComponent(message);
  
  // Open WhatsApp share dialog
  window.open(
    `https://wa.me/?text=${encodedMessage}`,
    '_blank'
  );
};

/**
 * Share campaign to WhatsApp with Nepali message
 * @param {Object} options - Share options
 */
export const shareToWhatsAppNepali = ({ 
  campaignId, 
  campaignTitle, 
  userId = null,
  raisedAmount = null,
  goalAmount = null,
  donorCount = null,
  isUrgent = false
}) => {
  const baseUrl = window.location.origin;
  const shareUrl = userId 
    ? `${baseUrl}/campaign/${campaignId}?ref=${userId}`
    : `${baseUrl}/campaign/${campaignId}`;

  let nepaliMessage = '';
  
  if (isUrgent) {
    nepaliMessage += '🚨 *जरुरी फन्डरेजर* 🚨\n';
    nepaliMessage += '━━━━━━━━━━━━━━━━━━━━\n\n';
  } else {
    nepaliMessage += '💙 *यो कारणलाई सहयोग गर्नुहोस्* 💙\n';
    nepaliMessage += '━━━━━━━━━━━━━━━━━━━━\n\n';
  }
  
  nepaliMessage += `*${campaignTitle}*\n\n`;
  
  if (raisedAmount !== null && goalAmount !== null) {
    const progress = Math.round((raisedAmount / goalAmount) * 100);
    const raisedFormatted = raisedAmount.toLocaleString('en-NP');
    const goalFormatted = goalAmount.toLocaleString('en-NP');
    
    nepaliMessage += `💰 *प्रगति*\n`;
    nepaliMessage += `उठाइएको: रु ${raisedFormatted}\n`;
    nepaliMessage += `लक्ष्य: रु ${goalFormatted}\n`;
    nepaliMessage += `प्रगति: ${progress}%\n`;
    
    if (donorCount !== null && donorCount > 0) {
      nepaliMessage += `👥 ${donorCount} ${donorCount === 1 ? 'दाता' : 'दाताहरू'}\n`;
    }
    
    nepaliMessage += '\n';
  }
  
  nepaliMessage += '👉 फरक बनाउन मद्दत गर्नुहोस्!\n';
  nepaliMessage += '🙏 हरेक योगदानले गनिन्छ\n\n';
  nepaliMessage += '━━━━━━━━━━━━━━━━━━━━\n\n';
  nepaliMessage += shareUrl;
  
  const encodedMessage = encodeURIComponent(nepaliMessage);
  
  window.open(
    `https://wa.me/?text=${encodedMessage}`,
    '_blank'
  );
};

/**
 * Copy campaign link to clipboard
 * @param {string} campaignId - Campaign ID
 * @param {string} userId - Optional user ID for referral
 * @returns {Promise<boolean>} Success status
 */
export const copyCampaignLink = async (campaignId, userId = null) => {
  const baseUrl = window.location.origin;
  const shareUrl = userId 
    ? `${baseUrl}/campaign/${campaignId}?ref=${userId}`
    : `${baseUrl}/campaign/${campaignId}`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Share to multiple platforms
 * @param {Object} options - Share options
 * @param {string} platform - 'whatsapp' | 'facebook' | 'twitter' | 'copy'
 */
export const shareCampaign = (options, platform = 'whatsapp') => {
  const { campaignId, campaignTitle, userId } = options;
  const baseUrl = window.location.origin;
  const shareUrl = userId 
    ? `${baseUrl}/campaign/${campaignId}?ref=${userId}`
    : `${baseUrl}/campaign/${campaignId}`;

  switch (platform) {
    case 'whatsapp':
      shareToWhatsApp(options);
      break;
    
    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
      break;
    
    case 'twitter':
      const tweetText = `Support this cause: ${campaignTitle} ${shareUrl}`;
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
        '_blank'
      );
      break;
    
    case 'copy':
      copyCampaignLink(campaignId, userId);
      break;
    
    default:
      shareToWhatsApp(options);
  }
};
