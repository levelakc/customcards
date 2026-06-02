import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api/api';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);
    const [upsellProduct, setUpsellProduct] = useState(null);
    const [isGlobalLoading, setIsGlobalLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        try {
            setIsGlobalLoading(true);
            
            // Fetch everything in parallel, but handle individual errors
            const [
                fetchedProducts, 
                fetchedCategories, 
                fetchedGallery, 
                fetchedUpsell
            ] = await Promise.all([
                api.getProducts().catch(err => {
                    console.error("Failed to fetch products:", err);
                    return [];
                }),
                api.getCategories().catch(err => {
                    console.error("Failed to fetch categories:", err);
                    return [];
                }),
                api.getGalleryImages().catch(err => {
                    console.error("Failed to fetch gallery:", err);
                    return { images: [] };
                }),
                api.getUpsellProduct().catch(err => {
                    // It's normal for upsell to be missing, don't break the app
                    console.warn("Optional upsell product not found (404 is expected if none set)");
                    return null;
                })
            ]);
            
            setProducts(fetchedProducts || []);
            setCategories(fetchedCategories || []);
            setUpsellProduct(fetchedUpsell || null);
            
            // Format gallery images into absolute URLs
            const fullImageUrls = (fetchedGallery?.images || []).map(url => 
                url.startsWith('http') || url.startsWith('blob:') ? url : `${api.BASE_URL}${url}`
            );
            setGalleryImages(fullImageUrls);
        } catch (error) {
            console.error("Critical error during global data preload:", error);
        } finally {
            // Add a tiny delay to ensure smooth transition from loading screen
            setTimeout(() => setIsGlobalLoading(false), 500);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const refreshData = () => fetchAllData();

    const value = { 
        products, 
        categories, 
        galleryImages, 
        upsellProduct,
        isGlobalLoading,
        refreshData 
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
