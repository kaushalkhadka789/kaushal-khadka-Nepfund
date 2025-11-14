import express from 'express';
import Campaign from '../models/Campaign.model.js';

const router = express.Router();

// GET /share/campaign/:id -> returns HTML with OG meta and redirects to SPA
router.get('/share/campaign/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id).lean();
    if (!campaign) {
      return res.status(404).send('Campaign not found');
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const frontendBase = process.env.FRONTEND_URL || `${protocol}://${host.replace(':5000', ':3000')}`;
    const pageUrl = `${frontendBase}/campaign/${campaign._id}`;

    const title = campaign.title || 'Campaign';
    const descSource = (campaign.description || '') + ' ' + (campaign.story || '');
    const description = descSource.trim().slice(0, 200) || 'Support this campaign on NepFund.';
    const imagePath = Array.isArray(campaign.images) && campaign.images.length > 0 ? campaign.images[0] : null;
    const imageUrl = imagePath ? `${baseUrl}/${imagePath.startsWith('uploads') ? '' : ''}${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}` : `${frontendBase}/vite.svg`;

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:url" content="${pageUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta http-equiv="refresh" content="0; url=${pageUrl}" />
  </head>
  <body>
    <p>Redirecting to <a href="${pageUrl}">${pageUrl}</a>...</p>
    <script>window.location.replace(${JSON.stringify(pageUrl)});</script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err) {
    return res.status(500).send('Failed to generate share page');
  }
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default router;


