export const getRelativeUploadPath = (absolutePath = '', fallbackPath = '') => {
  const normalized = absolutePath.replace(/\\/g, '/');
  const uploadsIndex = normalized.indexOf('uploads/');
  if (uploadsIndex !== -1) {
    return normalized.substring(uploadsIndex);
  }
  return fallbackPath ? fallbackPath.replace(/\\/g, '/') : normalized;
};

export const toCampaignResponse = (campaignDoc) => {
  if (!campaignDoc) return campaignDoc;
  const obj = typeof campaignDoc.toObject === 'function'
    ? campaignDoc.toObject({ virtuals: true })
    : { ...campaignDoc };

  const galleryImages = Array.isArray(obj.storyDetails?.images) ? obj.storyDetails.images : [];
  const campaignImages = Array.isArray(obj.images) ? obj.images : [];
  const coverImage = obj.imageUrl || galleryImages[0] || campaignImages[0] || '';

  return {
    ...obj,
    imageUrl: coverImage
  };
};

