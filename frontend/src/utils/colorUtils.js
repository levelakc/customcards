/**
 * A map from Hebrew color names (from the database) to CSS-friendly keys.
 */
export const nameToKeyMap = {
    'זהב': 'gold',
    'כסף': 'silver',
    'שחור': 'black',
    'רוז גולד': 'roseGold',
    'צבעוני': 'colorful',
};

/**
 * A map from engraving color keys back to Hebrew names for display on the UI.
 */
export const engravingColorNames = {
    black: 'שחורה',
    silver: 'כסופה',
    gold: 'מוזהבת',
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
    gold:     { name: 'זהב',       engraving: ['black'],    bgColor: 'bg-yellow-500' },
    silver:   { name: 'כסף',       engraving: ['black'],    bgColor: 'bg-gray-300' },
    roseGold: { name: 'רוז גולד',  engraving: ['black'],    bgColor: 'gradient-roseGold' },
    colorful: { name: 'צבעוני',    engraving: ['silver'],   bgColor: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' },
    black:    { name: 'שחור',       engraving: ['silver', 'gold'], bgColor: 'gradient-black' },
};

/**
 * A centralized utility to sort color names based on a preferred order.
 * This ensures 'Gold' and 'Silver' appear first in the UI.
 * @param {string[]} colors - An array of color names (e.g., ['שחור', 'זהב']).
 * @returns {string[]} The sorted array of color names.
 */
export const getSortedColors = (colors) => {
    if (!colors || colors.length === 0) return [];
    
    const preferredOrder = ['זהב', 'כסף', 'שחור', 'רוז גולד', 'צבעוני'];
    
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
 * Parses a full description string (e.g., "זהב עם חריטת שחורה")
 * into its corresponding card color key and engraving color key.
 * @param {string} fullDescription - The descriptive string from the cart item.
 * @returns {{cardColorKey: string, engravingColorKey: string}} An object containing the parsed keys.
 */
export const parseFullDescription = (fullDescription) => {
    let cardColorKey = 'black'; // Default fallback
    let engravingColorKey = 'silver'; // Default fallback

    if (!fullDescription) {
        return { cardColorKey, engravingColorKey };
    }

    // Regex to extract card color name and engraving color name
    const match = fullDescription.match(/(.*) עם חריטת (.*)/);

    if (match && match.length === 3) {
        const hebrewCardColorName = match[1].trim();
        const hebrewEngravingColorName = match[2].trim();

        // Map Hebrew card color name to key
        for (const hebrewName in nameToKeyMap) {
            if (nameToKeyMap.hasOwnProperty(hebrewName) && hebrewCardColorName.includes(hebrewName)) {
                cardColorKey = nameToKeyMap[hebrewName];
                break;
            }
        }

        // Map Hebrew engraving color name to key
        for (const key in engravingColorNames) {
            if (engravingColorNames.hasOwnProperty(key) && engravingColorNames[key] === hebrewEngravingColorName) {
                engravingColorKey = key;
                break;
            }
        }
    } else {
        // Handle cases where the description might just be a card color name (e.g., for upsell wallet)
        const hebrewCardColorName = fullDescription.trim();
        for (const hebrewName in nameToKeyMap) {
            if (nameToKeyMap.hasOwnProperty(hebrewName) && hebrewCardColorName.includes(hebrewName)) {
                cardColorKey = nameToKeyMap[hebrewName];
                // If only card color is specified, use its default engraving
                engravingColorKey = getDefaultEngraving(cardColorKey);
                break;
            }
        }
    }

    return { cardColorKey, engravingColorKey };
};

/**
 * A constant array of all available card color names.
 */
export const ALL_CARD_COLORS = Object.values(cardColorOptions).map(option => option.name);