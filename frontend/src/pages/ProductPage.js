import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useCart } from '../contexts/CartContext';
import * as api from '../api/api';
import CreditCardPreview from '../components/CreditCardPreview';
import { 
    cardColorOptions, 
    nameToKeyMap, 
    engravingColorNames, 
    getSortedColors 
} from '../utils/colorUtils';

export default function ProductPage() {
    const { route } = useRouter();
    const { addToCart } = useCart();
    const { id } = route.params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [selectedCardColorKey, setSelectedCardColorKey] = useState('');
    const [selectedEngravingColor, setSelectedEngravingColor] = useState('');
    
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const currentProduct = await api.getProductById(id);
                setProduct(currentProduct);

                if (currentProduct?.availableColors?.length > 0) {
                    const sortedColors = getSortedColors(currentProduct.availableColors);
                    const initialColorName = sortedColors[0];
                    const initialColorKey = nameToKeyMap[initialColorName];
                    setSelectedCardColorKey(initialColorKey);
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);
    
    useEffect(() => {
        if (!selectedCardColorKey) return;

        const validEngravings = cardColorOptions[selectedCardColorKey]?.engraving || [];
        if (!validEngravings.includes(selectedEngravingColor)) {
            setSelectedEngravingColor(validEngravings[0]);
        }
    }, [selectedCardColorKey, selectedEngravingColor]);

    const handleCardColorChange = (colorName) => {
        const colorKey = nameToKeyMap[colorName];
        setSelectedCardColorKey(colorKey);
    };

    const handleAddToCart = () => {
        if (product) {
            const cardColorName = cardColorOptions[selectedCardColorKey]?.name;
            const fullDescription = `${cardColorName} עם חריטת ${engravingColorNames[selectedEngravingColor]}`;
            addToCart(product, 1, fullDescription);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 2000);
        }
    };

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">טוען מוצר...</div>;
    if (!product) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">מוצר לא נמצא.</div>;

    const currentEngravingOptions = cardColorOptions[selectedCardColorKey]?.engraving || [];
    const sortedColorNames = getSortedColors(product.availableColors);

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div>
                        <CreditCardPreview 
                            cardColor={selectedCardColorKey} 
                            engravingColor={selectedEngravingColor}
                            logoUrl={product.image}
                            position={product.customization?.position}
                            scale={product.customization?.scale}
                            rotation={product.customization?.rotation}
                            isDraggable={false}
                        />
                    </div>
                    <div className="flex flex-col space-y-6">
                        <h1 className="text-4xl font-extrabold">{product.name}</h1>
                        <p className="text-gray-300 text-lg">{product.description}</p>
                        <p className="text-4xl font-bold text-indigo-400">₪{product.price}</p>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-3">בחר צבע מתכת:</h3>
                            <div className="flex flex-wrap gap-3">
                                {sortedColorNames.map(colorName => (
                                    <button 
                                        key={colorName} 
                                        onClick={() => handleCardColorChange(colorName)} 
                                        className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${selectedCardColorKey === nameToKeyMap[colorName] ? 'border-indigo-500 bg-indigo-500 bg-opacity-20' : 'border-gray-600 hover:border-gray-400'}`}
                                    >
                                        {colorName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3">בחר צבע חריטה:</h3>
                            <div className="flex flex-wrap gap-3">
                                {currentEngravingOptions.map(engraveColorKey => (
                                    <button 
                                        key={engraveColorKey} 
                                        onClick={() => setSelectedEngravingColor(engraveColorKey)} 
                                        className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${selectedEngravingColor === engraveColorKey ? 'border-indigo-500 bg-indigo-500 bg-opacity-20' : 'border-gray-600 hover:border-gray-400'}`}
                                    >
                                        {engravingColorNames[engraveColorKey]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="border-t border-b border-gray-700 py-4 space-y-2 text-sm text-gray-300">
                            <p>✓ זמן אספקה: עד 7 ימי עסקים.</p>
                            <p>✓ לאחר ביצוע ההזמנה, ניצור עמך קשר ב-WhatsApp לשליחת תמונה של המוצר הסופי לאישור לפני המשלוח.</p>
                        </div>

                        <button onClick={handleAddToCart} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                            הוסף לסל
                        </button>
                        {showSuccessMessage && (
                            <div className="text-center text-green-400 font-bold">
                                המוצר נוסף לסל בהצלחה!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}