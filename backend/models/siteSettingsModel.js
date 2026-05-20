import mongoose from 'mongoose';

const siteSettingsSchema = mongoose.Schema({
    key: { type: String, default: 'siteSettings', unique: true },
    backgroundVideoUrl: { type: String, required: true, default: '' },
    videoOpacity: { type: Number, required: true, default: 0.3, min: 0, max: 1 },
    // --- NEW FIELD ---
    logoUrl: { type: String, default: 'https://placehold.co/120x40/4A5568/FFFFFF?text=VIPCard' },
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;