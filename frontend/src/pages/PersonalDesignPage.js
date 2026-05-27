import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import { useCart } from '../contexts/CartContext';
import { UploadIcon } from '../components/Icons';
import CreditCardPreview from '../components/CreditCardPreview';
import Modal from '../components/Modal';
import { cardColorOptions, engravingColorNameKeys } from '../utils/colorUtils';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function PersonalDesignPage() {
    const { addToCart } = useCart();
    const [cardColor, setCardColor] = useState('black');
    const [engravingColor, setEngravingColor] = useState('silver');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const imgRef = useRef(null);
    
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

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1, // Default aspect ratio for cropping
                width,
                height
            ),
            width,
            height
        );
        setCrop(initialCrop);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setOriginalImage(reader.result);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const getCroppedImg = useCallback(() => {
        if (!completedCrop || !imgRef.current) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        // After cropping, apply the pencil sketch/background removal logic
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];
            
            if (alpha === 0) continue;
            
            const brightness = (r + g + b) / 3;
            if (brightness > 200) {
                data[i + 3] = 0;
            } else {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        setUploadedImage(canvas.toDataURL('image/png'));
        setIsCropModalOpen(false);
        setScale(1);
        setRotation(0);
        setPosition({ x: 45, y: 10 });
    }, [completedCrop]);
    
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
                                accept="image/png,image/jpeg" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                className="hidden" 
                            />
                            <div className="flex gap-2">
                                <button onClick={() => fileInputRef.current.click()} className="flex-grow flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-colors">
                                    <UploadIcon />
                                    <span>{uploadedImage ? t('replaceFileButton') : t('selectFileButton')}</span>
                                </button>
                                {uploadedImage && (
                                    <button 
                                        onClick={() => setIsCropModalOpen(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md transition-colors"
                                    >
                                        {t('crop')}
                                    </button>
                                )}
                            </div>
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

            <Modal isOpen={isCropModalOpen} onClose={() => setIsCropModalOpen(false)} title={t('crop')}>
                <div className="flex flex-col items-center">
                    {originalImage && (
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                        >
                            <img 
                                ref={imgRef}
                                src={originalImage} 
                                alt="Original" 
                                onLoad={onImageLoad}
                                className="max-w-full max-h-[60vh]"
                            />
                        </ReactCrop>
                    )}
                    <button 
                        onClick={getCroppedImg}
                        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-lg transition-colors"
                    >
                        {t('done')}
                    </button>
                </div>
            </Modal>
        </div>
    );
}