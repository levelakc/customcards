import { useState, useEffect, useMemo } from 'react';
import * as api from '../api/api';
import { cardColorOptions, nameToKeyMap } from '../utils/colorUtils';
import { designColorMap } from '../config/designConfig';

const getCompatibleDisplayData = (product) => {
    if (!product || !product.availableColors || product.availableColors.length === 0) {
        return { displayCardColor: 'black', displayEngravingColor: 'silver' };
    }
    const availableColorKeys = product.availableColors.map(name => nameToKeyMap[name]);
    const designType = designColorMap[product.image];
    const darkCardKeys = ['black', 'colorful'];
    let compatibleColorKeys = availableColorKeys;

    if (designType === 'dark') {
        compatibleColorKeys = availableColorKeys.filter(key => !darkCardKeys.includes(key));
    } else if (designType === 'light') {
        compatibleColorKeys = availableColorKeys.filter(key => darkCardKeys.includes(key));
    }

    if (compatibleColorKeys.length === 0) {
        compatibleColorKeys = availableColorKeys;
    }

    const cardKey = compatibleColorKeys[Math.floor(Math.random() * compatibleColorKeys.length)];
    const engravingOptions = cardColorOptions[cardKey]?.engraving || ['silver'];
    const engravingKey = engravingOptions[Math.floor(Math.random() * engravingOptions.length)];
    
    return { displayCardColor: cardKey, displayEngravingColor: engravingKey };
};

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndProcessProducts = async () => {
            try {
                setLoading(true);
                const allProducts = await api.getProducts();
                const processedProducts = allProducts.map(product => ({
                    ...product,
                    ...getCompatibleDisplayData(product),
                }));
                setProducts(processedProducts);
            } catch (err) {
                setError(err);
                console.error("Failed to fetch or process products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAndProcessProducts();
    }, []);

    const featuredProducts = useMemo(() => {
        const uniqueProductsByImage = Object.values(
            products.reduce((acc, product) => {
                if (product.image && !acc[product.image]) {
                    acc[product.image] = product;
                }
                return acc;
            }, {})
        );
        return [...uniqueProductsByImage].sort(() => 0.5 - Math.random()).slice(0, 12);
    }, [products]);

    return { products, featuredProducts, loading, error };
};