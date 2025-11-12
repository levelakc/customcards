/**
 * A map from Hebrew color names (from the database) to CSS-friendly keys.
 */
export const nameToKeyMap = {
    'זהב': 'gold',
    'כסף': 'silver',
    'שחור': 'black',
    'רוז גולד': 'roseGold',
    'צבעוני': 'colorful',
    'ויזה': 'visa',
};

/**
 * A map from engraving color keys back to Hebrew names for display on the UI.
 */
export const engravingColorNames = {
    black: 'שחורה',
    silver: 'כסופה',
    gold: 'מוזהבת',
};

/**
 * The core business logic for the application.
 * This object defines the available engraving options for each card color.
 */
export const cardColorOptions = {
    gold:     { name: 'זהב',       engraving: ['black'] },
    silver:   { name: 'כסף',       engraving: ['black'] },
    roseGold: { name: 'רוז גולד',  engraving: ['black'] },
    colorful: { name: 'צבעוני',    engraving: ['silver'] },
    visa:     { name: 'ויזה',       engraving: ['silver'] },
    black:    { name: 'שחור',       engraving: ['silver', 'gold'] },
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
 * A constant array of all available card color names.
 */
export const ALL_CARD_COLORS = Object.values(cardColorOptions).map(option => option.name);