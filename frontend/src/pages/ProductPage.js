import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useCart } from '../contexts/CartContext';
import * as api from '../api/api';
import CreditCardPreview from '../components/CreditCardPreview';
import ProductCard from '../components/ProductCard'; // Added this import
import { 
    cardColorOptions, 
    nameToKeyMap, 
    engravingColorNames, 
    engravingColorClasses, // Added this import
    getSortedColors 
} from '../utils/colorUtils';

export default function ProductPage() {
    const { route, navigate } = useRouter(); // Modified this line
    const { addToCart } = useCart();
    const { id } = route.params;
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
                }

                // Fetch all products to find related ones
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
                {/* Main Product Details Section */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image gallery */}
                    <div className="flex flex-col-reverse">
                        <div className="mt-6 w-full max-w-2xl mx-auto sm:px-6 lg:max-w-none lg:px-0">
                            <CreditCardPreview 
                                cardColorKey={selectedCardColorKey} 
                                engravingColorKey={selectedEngravingColor} 
                            />
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">{product.name}</h1>
                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl text-white">{product.price} ₪</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div
                                className="text-base text-gray-300 space-y-6"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-white">צבע כרטיס</h3>
                            <div className="mt-2 flex items-center space-x-3">
                                {sortedColorNames.map((colorName) => {
                                    const colorKey = nameToKeyMap[colorName];
                                    const colorClass = cardColorOptions[colorKey]?.bgColor || 'bg-gray-700';
                                    return (
                                        <button
                                            key={colorKey}
                                            className={`w-8 h-8 rounded-full border-2 ${selectedCardColorKey === colorKey ? 'border-blue-500' : 'border-transparent'} ${colorClass}`}
                                            onClick={() => handleCardColorChange(colorName)}
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
                                    const engravingName = engravingColorNames[engravingKey];
                                    const engravingClass = engravingColorClasses[engravingKey] || 'text-gray-400';
                                    return (
                                        <button
                                            key={engravingKey}
                                            className={`px-3 py-1 rounded-md border-2 ${selectedEngravingColor === engravingKey ? 'border-blue-500' : 'border-transparent'} ${engravingClass}`}
                                            onClick={() => setSelectedEngravingColor(engravingKey)}
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
                    </div>
                </div>

                {/* All Categories Button */}
                <button 
                    onClick={() => navigate('all-categories')}
                    className="mt-10 mb-10 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    כל הקטגוריות
                </button>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-3xl font-extrabold text-white text-center mb-10">מוצרים דומים שאולי תאהב</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(relatedProduct => (
                                <ProductCard 
                                    key={relatedProduct._id} 
                                    product={relatedProduct}
                                    cardColorKey={nameToKeyMap[getSortedColors(relatedProduct.availableColors)[0]] || 'black'}
                                    engravingColorKey={cardColorOptions[nameToKeyMap[getSortedColors(relatedProduct.availableColors)[0]] || 'black']?.engraving[0] || 'silver'}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}