import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import * as api from '../api/api';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';
// NEW: Import our color utilities
import { getSortedColors, nameToKeyMap, getDefaultEngraving } from '../utils/colorUtils';

export default function CategoryPage() {
    const { route } = useRouter();
    const { id } = route.params;
    const { t, i18n } = useTranslation();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log("CategoryPage: Fetching data for ID:", id);
                const allProducts = await api.getProducts();
                const allCategories = await api.getCategories();
                
                console.log("CategoryPage: Fetched allCategories:", allCategories);
                console.log("CategoryPage: Fetched allProducts:", allProducts);

                const currentCategory = allCategories.find(c => String(c._id) === String(id));
                const productsInCategory = allProducts.filter(p => String(p.category?._id) === String(id));

                console.log("CategoryPage: currentCategory found:", currentCategory);
                console.log("CategoryPage: productsInCategory found:", productsInCategory);

                setCategory(currentCategory);
                setProducts(productsInCategory);
            } catch (error) {
                console.error("Failed to fetch category data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, i18n.language]);

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">טוען קטגוריה...</div>;
    if (!category) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">קטגוריה לא נמצאה.</div>;

    return (
        <div className="bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-white mb-8 font-dancing">{category.name}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {products.map(product => {
                        // --- NEW LOGIC TO DETERMINE CARD COLOR ---
                        const sortedColorNames = getSortedColors(product.availableColors);
                        const primaryColorName = sortedColorNames.length > 0 ? sortedColorNames[0] : 'שחור';
                        const cardColorKey = nameToKeyMap[primaryColorName] || 'black';
                        const engravingColorKey = getDefaultEngraving(cardColorKey);
                        // --- END OF NEW LOGIC ---

                        return (
                            // Pass the dynamic color props to the component
                            <ProductCard 
                                key={product._id} 
                                product={product}
                                cardColorKey={cardColorKey}
                                engravingColorKey={engravingColorKey}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}