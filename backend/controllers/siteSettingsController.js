import SiteSettings from '../models/siteSettingsModel.js';

// @desc    Get site settings
// @route   GET /api/settings
const getSiteSettings = async (req, res) => {
    let settings = await SiteSettings.findOne({ key: 'siteSettings' });
    if (!settings) {
        settings = await SiteSettings.create({});
    }
    res.json(settings);
};

// @desc    Update site settings (admin only)
// @route   PUT /api/settings
const updateSiteSettings = async (req, res) => {
    const { backgroundVideoUrl, videoOpacity, logoUrl } = req.body;
    let settings = await SiteSettings.findOne({ key: 'siteSettings' });

    if (settings) {
        settings.backgroundVideoUrl = backgroundVideoUrl || settings.backgroundVideoUrl;
        settings.videoOpacity = videoOpacity ?? settings.videoOpacity; 
        settings.logoUrl = logoUrl || settings.logoUrl; // Add logoUrl logic
        
        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } else {
        res.status(404).json({ message: 'Settings not found' });
    }
};

export { getSiteSettings, updateSiteSettings };