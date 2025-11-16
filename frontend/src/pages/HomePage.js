import React, { useState, useEffect, useRef } from 'react';
import * as api from '../api/api';
import Carousel3D from '../components/Carousel3D';
import CategoryGallery from '../components/CategoryGallery';
import PersonalDesignPage from './PersonalDesignPage';
import AboutUs from '../components/AboutUs';
import Reviews from '../components/Reviews';
import RealLifeGallery from '../components/RealLifeGallery'; // FIX: The missing import is now added.

const MAX_CAROUSEL_ITEMS = 8;
const MOBILE_BREAKPOINT = 768;

export default function HomePage() {
    const [featured, setFeatured] = useState([]);
    const [galleryItems, setGalleryItems] = useState([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [backgroundVideoUrl, setBackgroundVideoUrl] = useState('');
    const [videoOpacity, setVideoOpacity] = useState(0.3);
    const designsSectionRef = useRef(null);
    const personalDesignSectionRef = useRef(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const settings = await api.getSiteSettings();
                setBackgroundVideoUrl(settings.backgroundVideoUrl);
                setVideoOpacity(settings.videoOpacity);

                const allProducts = await api.getProducts();
                const allCategories = await api.getCategories();
                
                const usedProductIds = new Set();
                
                const galleryProducts = [];
                allCategories.forEach(category => {
                    const productsInCategory = allProducts.filter(p => p.category?._id === category._id);
                    if (productsInCategory.length > 0) {
                        const randomIndex = Math.floor(Math.random() * productsInCategory.length);
                        const product = productsInCategory[randomIndex];
                        if (product && product._id && !usedProductIds.has(product._id)) {
                           galleryProducts.push(product);
                           usedProductIds.add(product._id);
                        }
                    }
                });
                setGalleryItems(galleryProducts);

                const carouselProducts = [];
                allCategories.forEach(category => {
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
                setGalleryItems([]);
            }
        };
        fetchInitialData();

        const handleScroll = () => setScrollPosition(window.pageYOffset);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollToDesigns = () => {
        designsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleScrollToPersonalDesign = () => {
        personalDesignSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <div className="relative h-screen flex items-center justify-center text-white text-center overflow-hidden">
                {backgroundVideoUrl && (
                    <video
                        key={backgroundVideoUrl}
                        autoPlay loop muted playsInline
                        className="absolute z-0 w-auto min-w-full min-h-full max-w-none transition-transform duration-500 ease-out"
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
                        className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg"
                        style={{
                            transition: 'transform 0.2s ease-out'
                        }}
                    >
                        <span className="shimmer-text">
                            כרטיסי אשראי ממתכת. העיצוב שלך.
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 drop-shadow-md">הפוך את כרטיס הפלסטיק המשעמם שלך ליצירת אומנות ממתכת יוקרתית.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={handleScrollToDesigns} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
                        >
                            צפה בקולקציה
                        </button>
                        <button 
                            onClick={handleScrollToPersonalDesign} 
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105"
                        >
                            נסה לעצב בעצמך
                        </button>
                    </div>
                </div>
            </div>
            
            <AboutUs />

            <div ref={designsSectionRef} className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white text-center mb-16">העיצובים שלנו</h2>
                    {featured.length > 0 ? <Carousel3D items={featured} /> : <div className="text-center text-gray-400 py-10">טוען עיצובים...</div>}
                </div>
            </div>

            {galleryItems.length > 0 && <CategoryGallery items={galleryItems} />}

            <div ref={personalDesignSectionRef}>
                <PersonalDesignPage />
            </div>

            <RealLifeGallery />

            <Reviews />
        </div>
    );
}
