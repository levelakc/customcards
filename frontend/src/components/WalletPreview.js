import React from 'react';

const WalletPreview = ({ walletColor = 'grey-black', customSvgUrl, svgPosition, svgScale, svgRotation }) => {
    // Define wallet colors based on the theme
    const walletColors = {
        'grey-black': {
            base: '#4A4A4A', // Dark grey
            accent: '#2C2C2C', // Near black
        },
        'grey-blue-black': {
            base: '#5A6B7C', // Slate blue/grey
            accent: '#2C2C2C', // Near black
        }
    };

    const selectedColor = walletColors[walletColor] || walletColors['grey-black'];

    return (
        <div className="relative w-64 h-40 rounded-lg overflow-hidden shadow-lg" style={{ background: `linear-gradient(145deg, ${selectedColor.base}, ${selectedColor.accent})` }}>
            {/* A subtle texture overlay */}
            <div 
                className="absolute inset-0"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\'/%3E%3C/g%3E%3C/svg%3E")',
                }}
            ></div>

            {/* Stitching effect */}
            <div className="absolute top-2 bottom-2 left-2 right-2 border border-dashed border-gray-500 opacity-50 rounded-md"></div>

            {/* Custom SVG Logo */}
            {customSvgUrl && (
                <div
                    className="absolute"
                    style={{
                        top: `${svgPosition?.y || 10}%`,
                        left: `${svgPosition?.x || 10}%`,
                        transform: `translate(-50%, -50%) scale(${svgScale || 1}) rotate(${svgRotation || 0}deg)`,
                        width: '50px', // Example fixed width
                        height: '50px', // Example fixed height
                    }}
                >
                    <img src={customSvgUrl} alt="Custom Design" className="w-full h-full object-contain" />
                </div>
            )}

            {/* Card Slot Illusion */}
            <div className="absolute top-4 left-4 w-24 h-1 bg-black opacity-20 rounded-full"></div>
        </div>
    );
};

export default WalletPreview;
