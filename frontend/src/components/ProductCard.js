import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import CreditCardPreview from './CreditCardPreview';
import { useTranslation } from 'react-i18next';
import { nameToKeyMap, getDefaultEngraving } from '../utils/colorUtils';


const ProductCard = ({ 
    product, 
    disableClick = false, 
    isMobile, 
    isCarousel = false,
    cardColorKey: propCardColorKey,
    engravingColorKey: propEngravingColorKey
}) => {
    const { navigate } = useRouter();
    const { t, i18n } = useTranslation();
    const [colorIndex, setColorIndex] = useState(0);

    useEffect(() => {
        // If external color is provided, we don't cycle internally
        if (propCardColorKey || !product || !product.availableColors || product.availableColors.length <= 1) return;

        // Use a slightly slower interval in the carousel to keep performance high
        const intervalTime = isCarousel ? 3000 : 2500; 
        
        const colorInterval = setInterval(() => {
            setColorIndex(prevIndex => (prevIndex + 1) % product.availableColors.length);
        }, intervalTime);

        return () => clearInterval(colorInterval);
    }, [product, isCarousel, propCardColorKey]);
    
    if (!product) {
        return null;
    }

    const currentLanguage = i18n.language || 'he';
    const productName = (product.name?.[currentLanguage] || product.name || '').toString();
    const productDescription = (product.description?.[currentLanguage] || product.description || '').toString();

    const availableColors = product.availableColors || [];
    
    // Logic: Use prop if provided, otherwise use internal cycle, otherwise fallback to first available or black
    const finalCardColor = useMemo(() => {
        if (propCardColorKey) return propCardColorKey;
        if (availableColors.length > 0) {
            const colorName = availableColors[colorIndex];
            return nameToKeyMap[colorName] || colorName || 'black';
        }
        return 'black';
    }, [propCardColorKey, availableColors, colorIndex]);

    const finalEngravingColor = useMemo(() => {
        if (propEngravingColorKey) return propEngravingColorKey;
        if (product.customization?.engraveColors?.[0]) return product.customization.engraveColors[0];
        return getDefaultEngraving(finalCardColor);
    }, [propEngravingColorKey, product.customization, finalCardColor]);

    const handleClick = (e) => {
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
            className="glass-panel group flex flex-col h-full cursor-pointer relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transform hover:-translate-y-2"
        >
            {/* Share Button Overlay */}
            <button 
                onClick={handleShare}
                className="absolute top-4 right-4 z-20 p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gold-500 hover:text-black hover:border-gold-500 shadow-xl"
                title={t('share')}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </button>
            <div 
                className="transition-transform duration-300 md:group-hover:-translate-y-1 relative z-0 p-4"
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
                    isCarousel={isCarousel}
                />
            </div>
            
            <div className="px-5 pb-5 pt-1 flex-grow flex flex-col text-center relative z-10">
                <div className="h-14 flex items-center justify-center overflow-hidden mb-1">
                    <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug">{productName.replace(/<br\s*\/?>/gi, ' ')}</h3>
                </div>
                <div className="h-10 flex items-start justify-center overflow-hidden mb-2">
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{productDescription}</p>
                </div>
                <div className="flex-grow"></div>
                <p className="text-white font-black text-lg mb-3">₪{product.price}</p>
                <button 
                    onClick={handleButtonClick}
                    className="btn-premium btn-gold py-2 w-full text-sm"
                >
                    {t('viewDetailsButton')}
                </button>
            </div>
        </div>
    );
};

export default React.memo(ProductCard);