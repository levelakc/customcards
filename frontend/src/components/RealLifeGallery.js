import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as api from '../api/api';
import { useTranslation } from 'react-i18next'; // Import useTranslation

/**
 * A modal component for viewing an image in a larger overlay.
 * Uses a portal to document.body so parent CSS transforms (e.g. AnimatedSection)
 * never trap `position: fixed`.
 */
const ImageModal = ({ imageUrl, onClose }) => {
    useEffect(() => {
        if (!imageUrl) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [imageUrl, onClose]);

    if (!imageUrl) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[999] p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="relative flex items-center justify-center max-w-[92vw] max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
                <img
                    src={imageUrl}
                    alt="Enlarged view"
                    className="max-w-[92vw] max-h-[86vh] object-contain rounded-xl shadow-2xl border border-gold-500/30"
                />
                <button 
                    onClick={onClose}
                    className="absolute -top-3 -right-3 text-white bg-black/90 hover:bg-gold-500 hover:text-black border border-gold-500/50 rounded-full w-10 h-10 text-2xl flex items-center justify-center transition-colors cursor-pointer z-[1000] shadow-lg"
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>
        </div>,
        document.body
    );
};

/**
 * The main gallery component to display real-life project photos.
 */
export default function RealLifeGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const { t } = useTranslation(); // Initialize useTranslation

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const data = await api.getGalleryImages();
                // Ensure all image URLs are absolute for consistent display.
                const fullImageUrls = (data.images || []).map(url => 
                    url.startsWith('http') || url.startsWith('blob:') ? url : `${api.BASE_URL}${url}`
                );
                setImages(fullImageUrls);
            } catch (error) {
                console.error("Failed to fetch gallery images:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    // Don't render the component if there are no images to show.
    if (images.length === 0 && !loading) {
        return null; 
    }

    return (
        <div className="bg-[#181818] py-20 border-t border-b border-gold-500/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl text-white text-center mb-16">
                    {t('ourRealLifeWork')}
                </h2>
                {loading ? (
                     <div className="text-center text-gray-300">{t('loadingGallery')}</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {images.map((url, index) => (
                            <div 
                                key={index} 
                                className="group cursor-pointer overflow-hidden rounded-xl border border-gold-500/25 hover:border-gold-400/70 shadow-lg hover:shadow-[0_0_24px_rgba(212,175,55,0.25)] transition-all duration-300"
                                onClick={() => setSelectedImage(url)}
                            >
                                <img 
                                    src={url} 
                                    alt={`Real life example ${index + 1}`}
                                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
        </div>
    );
}
