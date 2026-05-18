import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../contexts/RouterContext';
import ProductCard from './ProductCard';
import { nameToKeyMap, getDefaultEngraving } from '../utils/colorUtils';
import { useTranslation } from 'react-i18next';

// The component now receives an `items` prop and no longer fetches its own data.
export default function CategoryGallery({ items = [] }) {
    const { i18n } = useTranslation();
    const [colorIndexes, setColorIndexes] = useState({});
    const { navigate } = useRouter();

    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, []);
    
    // This logic now depends on the `items` prop.
    useEffect(() => {
        if (items.length === 0) return;
        const initialIndexes = {};
        items.forEach(product => {
            initialIndexes[product._id] = 0;
        });
        setColorIndexes(initialIndexes);
    }, [items]);

    useEffect(() => {
        let interval;
        if (isVisible && items.length > 0) {
            interval = setInterval(() => {
                setColorIndexes(prevIndexes => {
                    const newIndexes = { ...prevIndexes };
                    items.forEach(item => {
                        const availableColors = item.availableColors || [];
                        if (availableColors.length > 1) {
                            const currentIndex = newIndexes[item._id] || 0;
                            newIndexes[item._id] = (currentIndex + 1) % availableColors.length;
                        }
                    });
                    return newIndexes;
                });
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [items, isVisible]);

    return (
        <div ref={elementRef} className="bg-gray-800 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-white text-center mb-16">קטגוריות המוצרים שלנו</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {items.map(product => {
                        if (!product) return null; // Add a guard for safety
                        const availableColors = product.availableColors || [];
                        const colorIndex = colorIndexes[product._id] || 0;
                        const safeColorIndex = colorIndex < availableColors.length ? colorIndex : 0;
                        const colorName = availableColors[safeColorIndex];
                        const cardColorKey = colorName ? nameToKeyMap[colorName] : 'black';
                        const engravingColorKey = getDefaultEngraving(cardColorKey);
                        const currentLanguage = i18n.language || 'he';
                        const categoryName = product.category?.name?.[currentLanguage] || product.category?.name?.he || product.category?.name?.en || product.category?.name || '';

                        return (
                            <div key={product._id} className="text-center">
                                <h3 
                                    className="mt-4 text-3xl font-extrabold tracking-tight text-white font-dancing cursor-pointer hover:text-indigo-400 transition-colors"
                                    onClick={() => navigate('category', { id: product.category._id })}
                                >
                                    {categoryName}
                                </h3>
                                <ProductCard 
                                    product={product}
                                    cardColorKey={cardColorKey}
                                    engravingColorKey={engravingColorKey}
                                />
                                
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}