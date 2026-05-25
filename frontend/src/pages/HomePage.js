import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
    const [featured, setFeatured] = useState([]);
    // const [allCategories, setAllCategories] = useState([]); // Removed
    const [backgroundVideoUrl, setBackgroundVideoUrl] = useState('');
    const [videoOpacity, setVideoOpacity] = useState(0.3);
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
    
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const settings = await api.getSiteSettings();
                setBackgroundVideoUrl(settings.backgroundVideoUrl);
                setVideoOpacity(settings.videoOpacity);

                // const fetchedCategories = await api.getCategories(); // No longer needed here
                // setAllCategories(fetchedCategories); // No longer needed here

                const allProducts = await api.getProducts();
                
                const usedProductIds = new Set();
                
                // Use a dummy categories array or fetch if needed for carousel, but not for CategoryProductGallery
                // For simplicity, let's assume we can get categories for carousel logic from fetchedCategories if needed.
                // However, the original logic already fetches products and then filters based on category,
                // so we don't strictly need to fetch categories here unless `fetchedCategories` is used later for other logic.
                // Re-introducing a minimal category fetch for existing carousel logic if `fetchedCategories` is not removed above.
                const fetchedCategoriesForCarousel = await api.getCategories(); 

                const carouselProducts = [];
                fetchedCategoriesForCarousel.forEach(category => {
                    const productsInCategory = allProducts.filter(p => p.category?._id === category._id);
                    if (productsInCategory.length > 0) {
                        let productToAdd = productsInCategory.find(p => !usedProductIds.has(p._id));
                        if (!productToAdd) {
                            productToAdd = productsInCategory[0];
                        }
                        
                        if (productToAdd && !carouselProducts.some(p => p._id === productToAdd._id)) {
                             carouselProducts.push(productToAdd);
                        }
                    }
                });
                
                const remainingProducts = allProducts.filter(p => !carouselProducts.some(cp => cp._id === p._id));
                remainingProducts.sort(() => 0.5 - Math.random());
                
                while (carouselProducts.length < MAX_CAROUSEL_ITEMS && remainingProducts.length > 0) {
                    carouselProducts.push(remainingProducts.shift());
                }

                carouselProducts.sort(() => 0.5 - Math.random());
                setFeatured(carouselProducts);

            } catch (err) {
                console.error("Failed to fetch initial data:", err);
                setFeatured([]);
            }
        };
        fetchInitialData();
    }, [i18n.language, t]);

    const handleScrollToDesigns = () => {
        designsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleScrollToPersonalDesign = () => {
        personalDesignSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
                            {t('heroTitle')}
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 drop-shadow-md">{t('heroDescription')}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={handleScrollToDesigns} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
                        >
                            {t('viewCollectionButton')}
                        </button>
                        <button 
                            onClick={handleScrollToPersonalDesign} 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
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