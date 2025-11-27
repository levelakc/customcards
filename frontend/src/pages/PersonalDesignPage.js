import React, { useState, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { UploadIcon } from '../components/Icons';
import CreditCardPreview from '../components/CreditCardPreview';
import { cardColorOptions, engravingColorNameKeys } from '../utils/colorUtils';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function PersonalDesignPage() {
    const { addToCart } = useCart();
    const [cardColor, setCardColor] = useState('black');
    const [engravingColor, setEngravingColor] = useState('silver');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const { t } = useTranslation(); // Initialize useTranslation
    
    // This state is correctly managed here in the parent component
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 45, y: 10 });

    const fileInputRef = useRef(null);
    const handleCardColorChange = (colorKey) => {
        setCardColor(colorKey);
        setEngravingColor(cardColorOptions[colorKey].engraving[0]);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedImage(URL.createObjectURL(file));
            // Reset transformations when a new image is uploaded
            setScale(1);
            setRotation(0);
            setPosition({ x: 45, y: 10 });
        }
    };
    
    const handleAddToCart = () => {
        if (!uploadedImage) {
            alert(t('uploadDesignAlert'));
            return;
        }
        
        const customProduct = {
            _id: `custom-${Date.now()}`, // Use _id for consistency
            name: t('personalDesignCardName'),
            price: 350,
            image: uploadedImage,
            customization: { position, scale, rotation }
        };
        const fullDescription = t('personalDesignDescription', {
            cardColor: t(cardColorOptions[cardColor].nameKey),
            engravingColor: t(engravingColorNameKeys[engravingColor])
        });
        addToCart(customProduct, 1, fullDescription);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 2000);
    };

    return (
        <div className="bg-gray-900 py-20 text-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div>
                        <CreditCardPreview 
                            cardColorKey={cardColor}
                            engravingColorKey={engravingColor}
                            logoUrl={uploadedImage}
                            scale={scale}
                            rotation={rotation}
                            position={position}
                            onPositionChange={setPosition}
                            onScaleChange={setScale}
                            onRotationChange={setRotation}
                            isDraggable={true}
                            showTransformHandles={true}
                        />
                    </div>
                    <div className="flex flex-col space-y-6">
                        <h1 className="text-4xl font-extrabold text-center font-dancing">{t('designYourCardTitle')}</h1>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-3">{t('chooseCardColorTitle')}</h3>
                            <div className="flex flex-wrap gap-3">
                                {Object.keys(cardColorOptions).map(colorKey => (
                                    <button 
                                        key={colorKey} 
                                        onClick={() => handleCardColorChange(colorKey)} 
                                        className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${cardColor === colorKey ? 'border-indigo-500 bg-indigo-500 bg-opacity-20' : 'border-gray-600 hover:border-gray-400'}`}
                                    >
                                        {t(cardColorOptions[colorKey].nameKey)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3">{t('chooseEngravingColorTitle')}</h3>
                            <div className="flex flex-wrap gap-3">
                                {cardColorOptions[cardColor].engraving.map(engraveColorKey => (
                                    <button 
                                        key={engraveColorKey} 
                                        onClick={() => setEngravingColor(engraveColorKey)} 
                                        className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${engravingColor === engraveColorKey ? 'border-indigo-500 bg-indigo-500 bg-opacity-20' : 'border-gray-600 hover:border-gray-400'}`}
                                    >
                                        {t(engravingColorNameKeys[engraveColorKey])}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3">{t('uploadDesignTitle')}</h3>
                            <input 
                                type="file" 
                                accept="image/svg+xml,image/png,image/jpeg" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                className="hidden" 
                            />
                            <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-colors">
                                <UploadIcon />
                                <span>{uploadedImage ? t('replaceFileButton') : t('selectFileButton')}</span>
                            </button>
                        </div>
                        
                        {uploadedImage && (
                            <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold">{t('adjustDesignTitle')}</h3>
                                <p className="text-sm text-gray-400 mb-3">{t('adjustDesignDescription')}</p>

                                {/* SCALE SLIDER */}
                                <div>
                                    <label htmlFor="scale-slider" className="block text-sm font-medium mb-1">
                                        {t('size')} {scale.toFixed(2)}x
                                    </label>
                                    <input
                                        id="scale-slider"
                                        type="range"
                                        min="0.25"
                                        max="4"
                                        step="0.01"
                                        value={scale}
                                        onChange={(e) => setScale(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                                    />
                                </div>

                                {/* ROTATION SLIDER */}
                                <div>
                                    <label htmlFor="rotation-slider" className="block text-sm font-medium mb-1">
                                        {t('rotation')} {Math.round(rotation)}°
                                    </label>
                                    <input
                                        id="rotation-slider"
                                        type="range"
                                        min="0"
                                        max="360"
                                        step="1"
                                        value={rotation}
                                        onChange={(e) => setRotation(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                                    />
                                </div>
                            </div>
                        )}
                        
                        <button onClick={handleAddToCart} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                            {t('addToCartButton')}
                        </button>
                        {showSuccessMessage && (<div className="text-center text-green-400 font-bold">{t('productAddedToCartSuccess')}</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}