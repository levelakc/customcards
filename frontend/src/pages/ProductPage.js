import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useCart } from '../contexts/CartContext';
import * as api from '../api/api';
import CreditCardPreview from '../components/CreditCardPreview';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';
import {
    nameToKeyMap,
    engravingColorNames,
    engravingColorClasses,
    getSortedColors,
    getDefaultEngraving,
} from '../utils/colorUtils';
import { cardColorBgClasses } from '../utils/tailwindColors';

export default function ProductPage() {
    const { route, navigate } = useRouter();
    const { addToCart } = useCart();
    const { id } = route.params;
    const { t, i18n } = useTranslation();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedCardColorKey, setSelectedCardColorKey] = useState('');
    const [selectedEngravingColor, setSelectedEngravingColor] = useState('');

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    useEffect(() => {
        const fetchProductAndRelated = async () => {
            try {
                setLoading(true);
                const currentProduct = await api.getProductById(id);
                setProduct(currentProduct);



                if (currentProduct?.availableColors?.length > 0) {
                    const sortedColors = getSortedColors(currentProduct.availableColors);
                    const initialColorName = sortedColors[0];
                    const initialColorKey = nameToKeyMap[initialColorName];
                    setSelectedCardColorKey(initialColorKey);

                    // Initialize engraving color based on the first available card color
                    setSelectedEngravingColor(currentProduct.customization?.engraveColors?.[0] || getDefaultEngraving(initialColorKey));
                } else {
                    // Fallback if no availableColors are defined
                    setSelectedCardColorKey('black'); // Default card color
                    setSelectedEngravingColor('silver'); // Default engraving color
                }

                const allProducts = await api.getProducts();
                const filteredRelated = allProducts.filter(
                    (p) => p.category?._id === currentProduct.category?._id && p._id !== currentProduct._id
                );
                setRelatedProducts(filteredRelated);

            } catch (error) {
                console.error("Failed to fetch product or related products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndRelated();
    }, [id, i18n.language]);

    const handleCardColorChange = (colorName) => {
        const colorKey = nameToKeyMap[colorName];
        setSelectedCardColorKey(colorKey);
    };

    const handleAddToCart = () => {
        if (product) {
            const cardColorName = Object.keys(nameToKeyMap).find(key => nameToKeyMap[key] === selectedCardColorKey);
            const engravingColorName = t(engravingColorNames[selectedEngravingColor]);
            const fullDescription = `${t(cardColorName)} עם חריטת ${engravingColorName}`;
            addToCart(product, 1, fullDescription);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 2000);
        }
    };

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">טוען מוצר...</div>;
    if (!product) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">מוצר לא נמצא.</div>;

    const currentEngravingOptions = product.customization?.engraveColors || [];
    const sortedColorNames = getSortedColors(product.availableColors);

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    <div className="flex flex-col-reverse">
                        <div className="mt-6 w-full max-w-2xl mx-auto sm:px-6 lg:max-w-none lg:px-0">
                            <CreditCardPreview 
                                cardColorKey={selectedCardColorKey} 
                                engravingColorKey={selectedEngravingColor} 
                                logoUrl={product.image} 
                            />
                        </div>
                    </div>

                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white font-dancing">{product.name[i18n.language]}</h1>
                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl text-white">{product.price} ₪</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div
                                className="text-base text-gray-300 space-y-6"
                                dangerouslySetInnerHTML={{ __html: product.description[i18n.language] }}
                            />
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-white">צבע כרטיס</h3>
                            <div className="mt-2 flex items-center space-x-3">
                                {sortedColorNames.map((colorName) => {
                                    const colorKey = nameToKeyMap[colorName];
                                    const colorClass = cardColorBgClasses[colorKey] || 'bg-gray-700';
                                    return (
                                        <button
                                            key={colorKey}
                                            className={`w-8 h-8 rounded-full border-2 ${selectedCardColorKey === colorKey ? 'border-blue-500' : 'border-transparent'} ${colorClass}`}
                                            onClick={() => {
                                                console.log("Card color button clicked:", colorName);
                                                handleCardColorChange(colorName);
                                            }}
                                            aria-label={`בחר צבע ${colorName}`}
                                        ></button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-white">צבע חריטה</h3>
                            <div className="mt-2 flex items-center space-x-3">
                                {currentEngravingOptions.map((engravingKey) => {
                                    const engravingName = t(engravingColorNames[engravingKey]);
                                    const engravingClass = engravingColorClasses[engravingKey] || 'text-gray-400';
                                    return (
                                        <button
                                            key={engravingKey}
                                            className={`px-3 py-1 rounded-md border-2 ${selectedEngravingColor === engravingKey ? 'border-blue-500' : 'border-transparent'} ${engravingClass}`}
                                            onClick={() => {
                                                console.log("Engraving color button clicked:", engravingKey);
                                                setSelectedEngravingColor(engravingKey);
                                            }}
                                        >
                                            {engravingName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <form className="mt-10">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="mt-6 w-full bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                הוסף לעגלה
                            </button>
                        </form>

                        {showSuccessMessage && (
                            <div className="mt-4 text-green-500 text-center">
                                המוצר נוסף לעגלה בהצלחה!
                            </div>
                        )}

                        <div className="mt-10 border-t border-gray-700 pt-10">
                            <h3 className="text-lg font-medium text-white mb-4">מידע נוסף</h3>
                            <ul className="space-y-4 text-gray-300">
                                <li className="flex items-start">
                                    <svg className="flex-shrink-0 h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span className="ml-3">זמן אספקה: עד 5 ימי עסקים.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="flex-shrink-0 h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span className="ml-3">קנייה מאובטחת באמצעות צד שלישי.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="flex-shrink-0 h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span className="ml-3">חומרים איכותיים ועמידים לאורך זמן.</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="flex-shrink-0 h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span className="ml-3">עיצוב אישי וייחודי לכל לקוח.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('all-categories')}
                    className="block mx-auto mt-10 mb-10 px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    כל הקטגוריות
                </button>

                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-3xl font-extrabold text-white text-center mb-10">מוצרים דומים שאולי תאהב</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {console.log("Related Products:", relatedProducts)}
                            {relatedProducts.map(relatedProduct => {
                                const cardColorKey = nameToKeyMap[getSortedColors(relatedProduct.availableColors)[0]] || 'black';
                                const engravingColorKey = relatedProduct.customization?.engraveColors?.[0] || 'silver';
                                return (
                                    <ProductCard 
                                        key={relatedProduct._id} 
                                        product={relatedProduct}
                                        cardColorKey={cardColorKey}
                                        engravingColorKey={engravingColorKey}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}