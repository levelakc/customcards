import React, { useState, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { UploadIcon } from '../components/Icons';
import CreditCardPreview from '../components/CreditCardPreview';
import { cardColorOptions, engravingColorNames } from '../utils/colorUtils';

export default function PersonalDesignPage() {
    const { addToCart } = useCart();
    const [cardColor, setCardColor] = useState('black');
    const [engravingColor, setEngravingColor] = useState('silver');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    
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
        }
    };
    
    const handleAddToCart = () => {
        if (!uploadedImage) {
            alert('אנא העלה עיצוב SVG או PNG תחילה.');
            return;
        }
        
        const customProduct = {
            _id: `custom-${Date.now()}`, // Use _id for consistency
            name: 'כרטיס בעיצוב אישי',
            price: 350,
            image: uploadedImage,
            customization: { position, scale, rotation }
        };
        const fullDescription = `${cardColorOptions[cardColor].name} עם חריטת ${engravingColorNames[engravingColor]}`;
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
                            cardColor={cardColor}
                            engravingColor={engravingColor}
                            logoUrl={uploadedImage}
                            scale={scale}
                            rotation={rotation}
                            position={position}
                            onPositionChange={setPosition} // This correctly passes the state setter
                            isDraggable={true}
                        />
                    </div>
                    <div className="flex flex-col space-y-6">
                        <h1 className="text-4xl font-extrabold text-center">עצב את הכרטיס שלך</h1>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-3">1. בחר צבע כרטיס:</h3>
                            <div className="flex flex-wrap gap-3">
                                {Object.keys(cardColorOptions).map(colorKey => (
                                    <button 
                                        key={colorKey} 
                                        onClick={() => handleCardColorChange(colorKey)} 
                                        className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${cardColor === colorKey ? 'border-indigo-500 bg-indigo-500 bg-opacity-20' : 'border-gray-600 hover:border-gray-400'}`}
                                    >
                                        {cardColorOptions[colorKey].name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3">2. בחר צבע חריטה:</h3>
                            <div className="flex flex-wrap gap-3">
                                {cardColorOptions[cardColor].engraving.map(engraveColorKey => (
                                    <button 
                                        key={engraveColorKey} 
                                        onClick={() => setEngravingColor(engraveColorKey)} 
                                        className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-all ${engravingColor === engraveColorKey ? 'border-indigo-500 bg-indigo-500 bg-opacity-20' : 'border-gray-600 hover:border-gray-400'}`}
                                    >
                                        {engravingColorNames[engraveColorKey]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-3">3. העלה את העיצוב שלך (SVG/PNG):</h3>
                            <input 
                                type="file" 
                                accept="image/svg+xml,image/png,image/jpeg" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                className="hidden" 
                            />
                            <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-colors">
                                <UploadIcon />
                                <span>{uploadedImage ? "החלף קובץ" : "בחר קובץ..."}</span>
                            </button>
                        </div>
                        
                        {uploadedImage && (
                            <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold">4. התאם את העיצוב:</h3>
                                <div>
                                    <label htmlFor="scale" className="block mb-2 text-sm font-medium">גודל (זום):</label>
                                    <input id="scale" type="range" min="0.5" max="2.5" step="0.05" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                                </div>
                                <div>
                                    <label htmlFor="rotation" className="block mb-2 text-sm font-medium">סיבוב:</label>
                                    <input id="rotation" type="range" min="0" max="360" step="1" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                                </div>
                            </div>
                        )}
                        
                        <button onClick={handleAddToCart} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105">
                            הוסף לסל
                        </button>
                        {showSuccessMessage && (<div className="text-center text-green-400 font-bold">המוצר נוסף לסל בהצלחה!</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}