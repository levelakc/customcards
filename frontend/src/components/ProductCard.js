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

    const handleShare = (e) => {
        e.stopPropagation();
        const shareData = {
            title: productName,
            text: productDescription,
            url: `${window.location.origin}/product?id=${product._id}`
        };

        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            // Fallback to WhatsApp
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${productName} - ${window.location.origin}/product?id=${product._id}`)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <div 
            onClick={handleClick}
            className="group flex flex-col h-full cursor-pointer relative"
        >
            {/* Share Button Overlay */}
            <button 
                onClick={handleShare}
                className="absolute top-4 right-4 z-20 p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold-500 hover:text-black hover:border-gold-500 shadow-xl"
                title={t('share')}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </button>
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