import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import CreditCardPreview from './CreditCardPreview';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product, cardColorKey, engravingColorKey, disableClick = false }) => {
    const { navigate } = useRouter();
    const { t } = useTranslation();

    // console.log(`ProductCard for ${product?._id}: received cardColorKey=${cardColorKey}, engravingColorKey=${engravingColorKey}`);

    if (!product) {
        return null;
    }

    const finalCardColor = cardColorKey || 'black';
    const finalEngravingColor = engravingColorKey || 'silver';

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
                <h3 className="text-xl font-semibold text-white mb-2">{product.name.replace(/<br\s*\/?>/gi, ' ')}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
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