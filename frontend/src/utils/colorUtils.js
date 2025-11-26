/**
 * A map from engraving color keys back to translation keys for display on the UI.
 */
export const engravingColorNameKeys = {
    black: 'engravingBlack',
    silver: 'engravingSilver',
    gold: 'engravingGold',
};

export const nameToKeyMap = {
    gold: 'gold',
    silver: 'silver',
    black: 'black',
    roseGold: 'roseGold',
    colorful: 'colorful',
};

export const engravingColorNames = {
    black: 'engravingBlack',
    silver: 'engravingSilver',
    gold: 'engravingGold',
};


export const engravingColorClasses = {
    black: 'bg-black text-white',
    silver: 'text-gray-400',
    gold: 'text-yellow-500',
};

export const engravingColorHex = {
    black: '#000000',
    silver: '#D1D5DB', // A light gray for silver
    gold: '#D4AF37',   // A golden yellow
};

/**
 * The core business logic for the application.
 * This object defines the available engraving options for each card color.
 */
export const cardColorOptions = {
    gold:     { nameKey: 'gold',       engraving: ['black'],    bgColor: 'bg-yellow-500' },
    silver:   { nameKey: 'silver',       engraving: ['black'],    bgColor: 'bg-gray-300' },
    roseGold: { nameKey: 'roseGold',  engraving: ['black'],    bgColor: 'gradient-roseGold' },
    colorful: { nameKey: 'colorful',    engraving: ['silver'],   bgColor: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' },
    black:    { nameKey: 'black',       engraving: ['silver', 'gold'], bgColor: 'gradient-black' },
};

/**
 * A centralized utility to sort color keys based on a preferred order.
 * This ensures 'gold' and 'silver' appear first in the UI.
 * @param {string[]} colors - An array of color keys (e.g., ['black', 'gold']).
 * @returns {string[]} The sorted array of color keys.
 */
export const getSortedColors = (colors) => {
    if (!colors || colors.length === 0) return [];
    
    const preferredOrder = ['gold', 'silver', 'black', 'roseGold', 'colorful'];
    
    return [...colors].sort((a, b) => {
        const indexA = preferredOrder.indexOf(a);
        const indexB = preferredOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return colors.indexOf(a) - colors.indexOf(b);
    });
};

/**
 * A helper to get the default engraving for a given card color key.
 * It will always return the first valid engraving option.
 * @param {string} cardColorKey - The key of the card color (e.g., 'gold').
 * @returns {string} The key of the default engraving color (e.g., 'black').
 */
export const getDefaultEngraving = (cardColorKey) => {
    const options = cardColorOptions[cardColorKey];
    // Check for options, the engraving property, and that the array is not empty
    if (!options || !options.engraving || options.engraving.length === 0) {
        return 'silver'; // A safe fallback for undefined colors
    }
    return options.engraving[0];
};

/**
 * Parses a full description string (e.g., "Gold with Black engraving")
 * into its corresponding card color key and engraving color key.
 * This function is designed to be language-agnostic, working with translated strings.
 * @param {string} fullDescription - The descriptive string from the cart item.
 * @param {function} t - The translation function from i18next.
 * @returns {{cardColorKey: string, engravingColorKey: string}} An object containing the parsed keys.
 */
export const parseFullDescription = (fullDescription, t) => {
    let cardColorKey = 'black'; // Default fallback
    let engravingColorKey = 'silver'; // Default fallback

    if (!fullDescription || !t) {
        return { cardColorKey, engravingColorKey };
    }

    const descriptionTemplate = t('personalDesignDescription', { cardColor: '{{cardColor}}', engravingColor: '{{engravingColor}}' });
    const regexString = descriptionTemplate
        .replace('{{cardColor}}', '(.*)')
        .replace('{{engravingColor}}', '(.*)');
    const match = fullDescription.match(new RegExp(regexString));

    if (match && match.length === 3) {
        const translatedCardColor = match[1].trim();
        const translatedEngravingColor = match[2].trim();

        // Find cardColorKey
        for (const key in cardColorOptions) {
            if (t(cardColorOptions[key].nameKey) === translatedCardColor) {
                cardColorKey = key;
                break;
            }
        }

        // Find engravingColorKey
        for (const key in engravingColorNameKeys) {
            if (t(engravingColorNameKeys[key]) === translatedEngravingColor) {
                engravingColorKey = key;
                break;
            }
        }
    } else {
        // Fallback for descriptions that might only contain the card color
        for (const key in cardColorOptions) {
            if (t(cardColorOptions[key].nameKey) === fullDescription.trim()) {
                cardColorKey = key;
                engravingColorKey = getDefaultEngraving(key);
                break;
            }
        }
    }

    return { cardColorKey, engravingColorKey };
};

/**
 * A constant array of all available card color name keys.
 */
export const ALL_CARD_COLORS = Object.values(cardColorOptions).map(option => option.nameKey);