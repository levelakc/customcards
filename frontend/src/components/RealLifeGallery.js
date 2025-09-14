import React, { useState, useEffect } from 'react';
import * as api from '../api/api';

/**
 * A modal component for viewing an image in a larger overlay.
 * @param {object} props
 * @param {string|null} props.imageUrl - The URL of the image to display.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 */
const ImageModal = ({ imageUrl, onClose }) => {
    // FIX: The useEffect hook is now at the top level of the component, before any returns.
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // The early return is now after the hook, which is correct.
    if (!imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div className="relative p-4" onClick={(e) => e.stopPropagation()}>
                <img src={imageUrl} alt="Enlarged view" className="max-w-screen-lg max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                <button 
                    onClick={onClose}
                    className="absolute -top-2 -right-2 text-white bg-gray-800 hover:bg-gray-900 rounded-full w-10 h-10 text-2xl flex items-center justify-center transition-colors"
                    aria-label="Close"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

/**
 * The main gallery component to display real-life project photos.
 */
export default function RealLifeGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

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
        <div className="bg-gray-800 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-white text-center mb-16">
                    העבודות שלנו בחיים האמיתיים
                </h2>
                {loading ? (
                     <div className="text-center text-gray-400">טוען גלריה...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((url, index) => (
                            <div 
                                key={index} 
                                className="group cursor-pointer overflow-hidden rounded-lg shadow-lg"
                                onClick={() => setSelectedImage(url)}
                            >
                                <img 
                                    src={url} 
                                    alt={`Real life example ${index + 1}`}
                                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-300"
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
