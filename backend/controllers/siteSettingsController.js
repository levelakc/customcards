import SiteSettings from '../models/siteSettingsModel.js';

// @desc    Get site settings
// @route   GET /api/settings
const getSiteSettings = async (req, res) => {
    let settings = await SiteSettings.findOne({ key: 'siteSettings' });
    if (!settings) {
        settings = await SiteSettings.create({
            wheelPrizes: [
                { label: "10% הנחה", discount: 10, probability: 50 },
                { label: "20% הנחה", discount: 20, probability: 30 },
                { label: "30% הנחה", discount: 30, probability: 10 },
                { label: "50% הנחה", discount: 50, probability: 5 },
                { label: "לא זכית", discount: 0, probability: 5 }
            ]
        });
    }
    res.json(settings);
};

// @desc    Update site settings (admin only)
// @route   PUT /api/settings
const updateSiteSettings = async (req, res) => {
    const { backgroundVideoUrl, videoOpacity, logoUrl, wheelPrizes } = req.body;
    let settings = await SiteSettings.findOne({ key: 'siteSettings' });

    if (settings) {
        if (backgroundVideoUrl !== undefined) settings.backgroundVideoUrl = backgroundVideoUrl;
        if (videoOpacity !== undefined) settings.videoOpacity = videoOpacity; 
        if (logoUrl !== undefined) settings.logoUrl = logoUrl;
        if (wheelPrizes !== undefined) settings.wheelPrizes = wheelPrizes;
        
        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } else {
        res.status(404).json({ message: 'Settings not found' });
    }
};

export { getSiteSettings, updateSiteSettings };