import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import CreditCardPreview from './CreditCardPreview';
import { useTranslation } from 'react-i18next';
import { nameToKeyMap, getDefaultEngraving } from '../utils/colorUtils';


const ProductCard = ({ product, disableClick = false, isMobile }) => {
    const { navigate } = useRouter();
    const { t, i18n } = useTranslation();
    const [colorIndex, setColorIndex] = useState(0);

    useEffect(() => {
        if (!product || !product.availableColors || product.availableColors.length <= 1) return;

        const intervalTime = 5000; // Longer interval on mobile
        const colorInterval = setInterval(() => {
            setColorIndex(prevIndex => (prevIndex + 1) % product.availableColors.length);
        }, intervalTime);

        return () => clearInterval(colorInterval);
    }, [product, isMobile]);
    
    // console.log(`ProductCard for ${product?._id}: received cardColorKey=${cardColorKey}, engravingColorKey=${engravingColorKey}`);

    if (!product) {
        return null;
    }

    const currentLanguage = i18n.language || 'he';
    const productName = (product.name?.[currentLanguage] || product.name || '').toString();
    const productDescription = (product.description?.[currentLanguage] || product.description || '').toString();

    const availableColors = product.availableColors || [];
    const colorName = availableColors[colorIndex] || 'שחור';
    const finalCardColor = nameToKeyMap[colorName] || 'black';
    const finalEngravingColor = product.customization?.engraveColors?.[0] || getDefaultEngraving(finalCardColor);

    const handleClick = (e) => {
        // Stop propagation to prevent carousel drag from triggering navigation
        e.stopPropagation(); 
        if (!disableClick) {
            navigate('product', { id: product._id });
        }
    };
    
    const handleButtonClick = (e) => {
        e.stopPropagation();
        navigate('product', { id: product._id });
    }

    return (
        <div 
            onClick={handleClick}
            className="group flex flex-col h-full cursor-pointer"
        >
            <div 
                className="transition-transform duration-300 md:group-hover:-translate-y-2 relative z-0"
                style={{ transform: 'translateZ(0)' }}
            >
                <CreditCardPreview 
                    cardColorKey={finalCardColor}
                    engravingColorKey={finalEngravingColor}
                    logoUrl={product.image}
                    position={product.customization?.position}
                    scale={product.customization?.scale}
                    rotation={product.customization?.rotation}
                    isDraggable={false}
                />
            </div>
            
            <div className="p-6 pt-2 flex-grow flex flex-col text-center relative z-10">
                <h3 className="text-xl font-semibold text-white mb-2">{productName.replace(/<br\s*\/?>/gi, ' ')}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{productDescription}</p>
                <div className="flex-grow"></div>
                <p className="text-indigo-400 font-bold text-lg mb-4">₪{product.price}</p>
                <button 
                    onClick={handleButtonClick}
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 transition-colors"
                >
                    {t('viewDetailsButton')}
                </button>
            </div>
        </div>
    );
};

export default React.memo(ProductCard);