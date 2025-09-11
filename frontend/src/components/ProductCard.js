import React from 'react';
import { useRouter } from '../contexts/RouterContext';
import CreditCardPreview from './CreditCardPreview';

/**
 * ProductCard Component
 * @param {object} props
 * @param {object} props.product - The product data to display.
 * @param {string} props.cardColorKey - The key for the card's color.
 * @param {string} props.engravingColorKey - The key for the engraving color.
 * @param {boolean} [props.disableWrapperClick=false] - If true, the main card wrapper is not clickable, only the button is.
 */
export default function ProductCard({ product, cardColorKey, engravingColorKey, disableWrapperClick = false }) {
    const { navigate } = useRouter();

    if (!product) {
        return null;
    }

    const finalCardColor = cardColorKey || 'black';
    const finalEngravingColor = engravingColorKey || 'silver';

    /**
     * Handles navigation to the product page and stops the event from
     * bubbling up to parent elements (like the carousel).
     * @param {React.MouseEvent} e - The mouse event.
     */
    const handleNavigate = (e) => {
        e.stopPropagation(); // Prevents the carousel's drag handlers from firing.
        navigate('product', { id: product._id });
    };

    return (
        <div
            // The main wrapper's onClick is now conditional.
            // If disableWrapperClick is true, this does nothing, allowing for dragging without navigation.
            onClick={!disableWrapperClick ? handleNavigate : undefined}
            className="group flex flex-col h-full cursor-pointer"
        >
            <div style={{
                perspective: '1000px',
                padding: '1rem 0'
            }}>
                <div
                    style={{
                        transform: 'rotateY(-10deg) rotateX(5deg)',
                        filter: 'drop-shadow(0 20px 15px rgba(0,0,0,0.4))'
                    }}
                    className="transition-transform transform group-hover:-translate-y-2"
                >
                    <CreditCardPreview
                        cardColor={finalCardColor}
                        engravingColor={finalEngravingColor}
                        logoUrl={product.image}
                        position={product.customization?.position}
                        scale={product.customization?.scale}
                        rotation={product.customization?.rotation}
                        isDraggable={false} // The card preview itself is never draggable inside a ProductCard
                    />
                </div>
            </div>

            <div className="p-6 pt-2 flex-grow flex flex-col text-center">
                <h3 className="text-l font-semibold text-white mb-2">{product.name}</h3>
                <div className="flex-grow"></div>
                <p className="text-indigo-400 font-bold text-lg mb-4">₪{product.price}</p>
                {/* This button now has its own explicit onClick handler to ensure it always works. */}
                <div
                    onClick={handleNavigate}
                    className="w-full bg-indigo-600 text-white py-2 rounded-md group-hover:bg-indigo-500 transition-colors"
                >
                    הצג פרטים
                </div>
            </div>
        </div>
    );
}
