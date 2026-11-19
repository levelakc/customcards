// Centralized Contact & Social Media configuration
// Update these links and phone number anytime — they automatically sync across
// the Contact & Social section, Footer, and Floating WhatsApp button.

export const contactConfig = {
    phoneDisplay: '051-234-5678',
    phoneHref: 'tel:+972512345678',
    whatsappNumber: '972512345678', // International format without '+' or leading '0'
    whatsappMessage: 'שלום, הגעתי דרך אתר VIPCard ואשמח לפרטים נוספים.',
    social: {
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        tiktok: 'https://tiktok.com',
    },
};

export const getWhatsAppUrl = (customMessage) => {
    const message = customMessage || contactConfig.whatsappMessage;
    return `https://wa.me/${contactConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
};
