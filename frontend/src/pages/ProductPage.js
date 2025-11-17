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
                <button 
                    onClick={() => navigate('all-categories')}
                    className="mb-10 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                >
                    כל הקטגוריות
                </button>

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