// Cookie Consent Management Utility

const COOKIE_CONSENT_KEY = 'nepfund_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'nepfund_cookie_preferences';
const USER_CONSENT_KEY = 'nepfund_user_consent'; // Track consent per user

export const CookieTypes = {
  NECESSARY: 'necessary',
  PREFERENCE: 'preference',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing'
};

// Get consent status (for guest/anonymous users)
export const getCookieConsent = () => {
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    return consent ? JSON.parse(consent) : null;
  } catch {
    return null;
  }
};

// Get user-specific consent
export const getUserConsent = (userId) => {
  if (!userId) return null;
  try {
    const userConsents = localStorage.getItem(USER_CONSENT_KEY);
    if (!userConsents) return null;
    const consents = JSON.parse(userConsents);
    return consents[userId] || null;
  } catch {
    return null;
  }
};

// Save user-specific consent
export const saveUserConsent = (userId, consent) => {
  if (!userId) return;
  try {
    const userConsents = localStorage.getItem(USER_CONSENT_KEY);
    const consents = userConsents ? JSON.parse(userConsents) : {};
    consents[userId] = {
      ...consent,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(USER_CONSENT_KEY, JSON.stringify(consents));
  } catch (error) {
    console.error('Failed to save user consent:', error);
  }
};

// Get preferences
export const getCookiePreferences = () => {
  try {
    const prefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    return prefs ? JSON.parse(prefs) : {
      [CookieTypes.NECESSARY]: true, // Always required
      [CookieTypes.PREFERENCE]: false,
      [CookieTypes.ANALYTICS]: false,
      [CookieTypes.MARKETING]: false
    };
  } catch {
    return {
      [CookieTypes.NECESSARY]: true,
      [CookieTypes.PREFERENCE]: false,
      [CookieTypes.ANALYTICS]: false,
      [CookieTypes.MARKETING]: false
    };
  }
};

// Save consent
export const saveCookieConsent = (consent) => {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...consent,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to save cookie consent:', error);
  }
};

// Save preferences
export const saveCookiePreferences = (preferences) => {
  try {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify({
      ...preferences,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to save cookie preferences:', error);
  }
};

// Accept all cookies
export const acceptAllCookies = (userId = null) => {
  const preferences = {
    [CookieTypes.NECESSARY]: true,
    [CookieTypes.PREFERENCE]: true,
    [CookieTypes.ANALYTICS]: true,
    [CookieTypes.MARKETING]: true
  };
  
  saveCookiePreferences(preferences);
  const consent = {
    accepted: true,
    method: 'accept_all',
    preferences
  };
  
  if (userId) {
    saveUserConsent(userId, consent);
  } else {
    saveCookieConsent(consent);
  }
  
  return preferences;
};

// Reject non-essential cookies
export const rejectNonEssentialCookies = (userId = null) => {
  const preferences = {
    [CookieTypes.NECESSARY]: true, // Always required
    [CookieTypes.PREFERENCE]: false,
    [CookieTypes.ANALYTICS]: false,
    [CookieTypes.MARKETING]: false
  };
  
  saveCookiePreferences(preferences);
  const consent = {
    accepted: true,
    method: 'reject_non_essential',
    preferences
  };
  
  if (userId) {
    saveUserConsent(userId, consent);
  } else {
    saveCookieConsent(consent);
  }
  
  return preferences;
};

// Save custom preferences
export const saveCustomPreferences = (preferences, userId = null) => {
  // Ensure necessary cookies are always enabled
  const finalPreferences = {
    ...preferences,
    [CookieTypes.NECESSARY]: true
  };
  
  saveCookiePreferences(finalPreferences);
  const consent = {
    accepted: true,
    method: 'custom',
    preferences: finalPreferences
  };
  
  if (userId) {
    saveUserConsent(userId, consent);
  } else {
    saveCookieConsent(consent);
  }
  
  return finalPreferences;
};

// Clear all consent (for reset functionality)
export const clearCookieConsent = (userId = null) => {
  try {
    if (userId) {
      // Clear user-specific consent
      const userConsents = localStorage.getItem(USER_CONSENT_KEY);
      if (userConsents) {
        const consents = JSON.parse(userConsents);
        delete consents[userId];
        localStorage.setItem(USER_CONSENT_KEY, JSON.stringify(consents));
      }
    } else {
      // Clear guest consent
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    }
  } catch (error) {
    console.error('Failed to clear cookie consent:', error);
  }
};

// Check if consent has been given (for guest users)
export const hasConsent = () => {
  return getCookieConsent() !== null;
};

// Check if user has given consent
export const hasUserConsent = (userId) => {
  if (!userId) return hasConsent(); // Fallback to guest consent
  return getUserConsent(userId) !== null;
};

// Check if specific cookie type is allowed
export const isCookieAllowed = (cookieType) => {
  const preferences = getCookiePreferences();
  return preferences[cookieType] === true;
};
