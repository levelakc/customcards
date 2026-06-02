import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useData } from '../contexts/DataContext';
import * as api from '../api/api';
import Carousel3D from '../components/Carousel3D';
import CategoryProductGallery from '../components/CategoryProductGallery'; // Import the new component
import PersonalDesignPage from './PersonalDesignPage';
import AnimatedSection from '../components/AnimatedSection';
import AboutUs from '../components/AboutUs';
import Reviews from '../components/Reviews';
import RealLifeGallery from '../components/RealLifeGallery'; 

const MAX_CAROUSEL_ITEMS = 12;

export default function HomePage() {
    const { t, i18n } = useTranslation();
    const { settings } = useSiteSettings();
    const { products, categories } = useData();
    const designsSectionRef = useRef(null);
    const personalDesignSectionRef = useRef(null);

    // FIX: useEffect hook to calculate and set the viewport height for mobile browsers
    useEffect(() => {
        const setAppHeight = () => {
            // Calculate the inner height of the window (the true viewport height)
            const doc = document.documentElement;
            doc.style.setProperty('--app-height', `${window.innerHeight}px`);
        };

        // Set the height on load and listen for changes
        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        window.addEventListener('orientationchange', setAppHeight);

        return () => {
            window.removeEventListener('resize', setAppHeight);
            window.removeEventListener('orientationchange', setAppHeight);
        };
    }, []);

    const featured = useMemo(() => {
        if (!products.length || !categories.length) return [];

        const usedProductIds = new Set();
        const carouselProducts = [];
        
        categories.forEach(category => {
            const productsInCategory = products.filter(p => p.category?._id === category._id);
            if (productsInCategory.length > 0) {
                let productToAdd = productsInCategory.find(p => !usedProductIds.has(p._id));
                if (!productToAdd) {
                    productToAdd = productsInCategory[0];
                }
                
                if (productToAdd && !carouselProducts.some(p => p._id === productToAdd._id)) {
                        carouselProducts.push(productToAdd);
                        usedProductIds.add(productToAdd._id);
                }
            }
        });
        
        const remainingProducts = products.filter(p => !carouselProducts.some(cp => cp._id === p._id));
        const shuffledRemaining = [...remainingProducts].sort(() => 0.5 - Math.random());
        
        while (carouselProducts.length < MAX_CAROUSEL_ITEMS && shuffledRemaining.length > 0) {
            carouselProducts.push(shuffledRemaining.shift());
        }

        return [...carouselProducts].sort(() => 0.5 - Math.random());
    }, [products, categories]);

    const handleScrollToDesigns = () => {
        designsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleScrollToPersonalDesign = () => {
        personalDesignSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const backgroundVideoUrl = settings.backgroundVideoUrl;
    const videoOpacity = settings.videoOpacity;

    return (
        <div>
            {/* FIX: Removed 'h-screen' and used the custom 'var(--app-height)' style */}
            <div 
                className="relative flex items-center justify-center text-white text-center overflow-hidden"
                style={{ height: 'var(--app-height, 100vh)' }} 
            >
                {backgroundVideoUrl && (
                    <video
                        key={backgroundVideoUrl}
                        autoPlay loop muted playsInline
                        className="absolute z-0 w-full h-full object-cover transition-transform duration-500 ease-out"
                        style={{ 
                            opacity: videoOpacity
                        }}
                        src={(() => {
                            if (!backgroundVideoUrl) return '';
                            let formattedUrl = backgroundVideoUrl.trim();
                            // Correct malformed 'https//' to 'https://'
                            if (formattedUrl.startsWith('https//') && !formattedUrl.startsWith('https://')) {
                                formattedUrl = formattedUrl.replace('https//', 'https://');
                            }
                            // If it's still not an absolute URL, prepend BASE_URL
                            if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
                                return `${api.BASE_URL}${formattedUrl}`;
                            }
                            return formattedUrl;
                        })()}
                    ></video>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                
                <div className="particles-container">
                    {Array.from({ length: 10 }).map((_, i) => <div key={i} className="particle"></div>)}
                </div>
                <div className="machinery-spark-container">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="weld-spark"></div>)}
                </div>

                <div className="z-10 p-5">
                    <h1 
                        className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg font-dancing"
                        style={{
                            transition: 'transform 0.2s ease-out'
                        }}
                    >
                        <span className="shimmer-text">
                            {settings?.heroTitle || t('heroTitle')}
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 drop-shadow-md">{settings?.heroDescription || t('heroDescription')}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
                        <button 
                            onClick={handleScrollToDesigns} 
                            className="btn-premium btn-gold text-lg px-10"
                        >
                            {t('viewCollectionButton')}
                        </button>
                        <button 
                            onClick={handleScrollToPersonalDesign} 
                            className="btn-premium btn-obsidian text-lg px-10"
                        >
                            {t('tryDesignYourselfButton')}
                        </button>
                    </div>
                </div>
            </div>
            
            <AnimatedSection animation="fade-in-up">
                <AboutUs />
            </AnimatedSection>

            <AnimatedSection animation="fade-in-left">
                <div ref={designsSectionRef} className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-white text-center mb-16">{t('ourDesignsTitle')}</h2>
                        {featured.length > 0 ? <Carousel3D items={featured} /> : <div className="text-center text-gray-400 py-10">{t('loadingDesigns')}</div>}
                    </div>
                </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-in-right">
                <CategoryProductGallery />
            </AnimatedSection>

            <AnimatedSection animation="fade-in-up">
                <div ref={personalDesignSectionRef}>
                    <PersonalDesignPage />
                </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-in-left">
                <RealLifeGallery />
            </AnimatedSection>

            <AnimatedSection animation="fade-in-right">
                <Reviews />
            </AnimatedSection>
        </div>
    );
}