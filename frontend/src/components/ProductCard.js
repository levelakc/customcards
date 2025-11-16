import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import CreditCardPreview from './CreditCardPreview';

export default function ProductCard({ product, cardColorKey, engravingColorKey, disableClick = false }) {
    const { navigate } = useRouter();

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
                className="transition-transform duration-300 md:group-hover:-translate-y-2"
                style={{ transform: 'translateZ(0)' }}
            >
                <CreditCardPreview 
                    cardColor={finalCardColor}
                    engravingColor={finalEngravingColor}
                    logoUrl={product.image}
                    position={product.customization?.position}
                    scale={product.customization?.scale}
                    rotation={product.customization?.rotation}
                    isDraggable={false}
                />
            </div>
            
            <div className="p-6 pt-2 flex-grow flex flex-col text-center">
                <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                <div className="flex-grow"></div>
                <p className="text-indigo-400 font-bold text-lg mb-4">₪{product.price}</p>
                <button 
                    onClick={handleButtonClick}
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 transition-colors"
                >
                    הצג פרטים
                </button>
            </div>
        </div>
    );
}