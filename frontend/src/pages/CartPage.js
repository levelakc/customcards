import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api/api';
import CreditCardPreview from '../components/CreditCardPreview';
import WalletPreview from '../components/WalletPreview';
import Modal from '../components/Modal';
import { parseFullDescription } from '../utils/colorUtils'; // Import the new utility function
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, addToCart } = useCart();
    const { navigate } = useRouter();
    const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
    const [upsellProduct, setUpsellProduct] = useState(null);
    const [customSvgUrl, setCustomSvgUrl] = useState(null);
    const [customization, setCustomization] = useState({
        position: { x: 50, y: 50 },
        scale: 1,
        rotation: 0,
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const { t } = useTranslation(); // Initialize useTranslation

    useEffect(() => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomSvgUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    }, [selectedFile]);


    useEffect(() => {
        const fetchUpsellProduct = async () => {
            try {
                const product = await api.getUpsellProduct();
                setUpsellProduct(product);
            } catch (error) {
                console.error("Could not fetch upsell product:", error);
                setUpsellProduct(null); // Ensure it's null if there's an error
            }
        };

        fetchUpsellProduct();
    }, []);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleProceedToCheckout = () => {
        // Only show the modal if there is an upsell product and it's not already in the cart
        if (upsellProduct && !cartItems.some(item => item._id === upsellProduct._id)) {
            setIsUpsellModalOpen(true);
        } else {
            handleFinalCheckout();
        }
    };

    const handleFinalCheckout = () => {
        setIsUpsellModalOpen(false);
        navigate('checkout');
    };

    const handleAddUpsellItem = () => {
        if (upsellProduct) {
            const upsellData = {
                ...upsellProduct,
                // The 'image' for the cart can be the base wallet image
                // The custom design is stored separately
                customization: {
                    ...customization,
                    customSvgUrl: customSvgUrl, // Save the data URL of the uploaded SVG
                },
                // Differentiate this from a standard product in the cart
                isCustomized: true, 
            };
            addToCart(upsellData, 1, 'grey-black'); // Default color for wallet
        }
        handleFinalCheckout();
    };

    if (cartItems.length === 0) {
        return (
            <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center">
                <h1 className="text-4xl font-extrabold mb-4 font-dancing">{t('emptyCartTitle')}</h1>
                <p className="text-xl text-gray-400 mb-8">{t('emptyCartMessage')}</p>
                <button 
                    onClick={() => navigate('home')} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                >
                    {t('backToShopButton')}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold mb-8 font-dancing">{t('yourCartTitle')}</h1>
                <div className="bg-gray-800 rounded-lg shadow-xl">
                    <ul className="divide-y divide-gray-700">
                        {cartItems.map(item => (
                            <li key={item.cartItemId} className="p-4 sm:p-6 flex items-center space-x-4 space-x-reverse">
                                <div className="w-32 h-auto flex-shrink-0">
                                    {item.isCustomized ? (
                                        <WalletPreview 
                                            walletColor={item.selectedColor}
                                            customSvgUrl={item.customization?.customSvgUrl}
                                            svgPosition={item.customization?.position}
                                            svgScale={item.customization?.scale}
                                            svgRotation={item.customization?.rotation}
                                        />
                                    ) : (
                                        (() => {
                                            const { cardColorKey, engravingColorKey } = parseFullDescription(item.selectedColor, t);
                                            return (
                                                <CreditCardPreview
                                                    cardColor={cardColorKey}
                                                    engravingColor={engravingColorKey}
                                                    logoUrl={item.image}
                                                    isDraggable={false}
                                                />
                                            );
                                        })()
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h2 className="text-lg sm:text-xl font-bold">{item.name}</h2>
                                    <p className="text-sm text-gray-400">{t('color')}: {item.selectedColor}</p>
                                    <p className="text-lg font-semibold text-indigo-400 mt-1">₪{item.price}</p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                     <div className="flex items-center border border-gray-600 rounded-md">
                                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="px-3 py-1 text-lg" disabled={item.quantity <= 1}>-</button>
                                        <span className="px-3 py-1 text-lg">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-3 py-1 text-lg">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.cartItemId)} className="text-xs text-red-500 hover:underline">{t('remove')}</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="p-6 border-t border-gray-700">
                        <div className="flex justify-between items-center text-xl font-bold mb-4">
                            <span>{t('subtotal')}:</span>
                            <span>₪{subtotal.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleProceedToCheckout} 
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg"
                        >
                            {t('proceedToCheckoutButton')}
                        </button>
                    </div>
                </div>
            </div>

            {upsellProduct && (
                <Modal isOpen={isUpsellModalOpen} onClose={handleFinalCheckout} title={t('customizeWalletTitle')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                        {/* Left Side: Preview */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg">
                            <h4 className="text-lg font-semibold mb-4">{t('preview')}</h4>
                            <WalletPreview
                                customSvgUrl={customSvgUrl}
                                svgPosition={customization.position}
                                svgScale={customization.scale}
                                svgRotation={customization.rotation}
                            />
                        </div>

                        {/* Right Side: Controls */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold">{t('addUpsellProduct', { productName: upsellProduct.name })}</h3>
                            <p className="text-lg font-semibold text-indigo-400">{t('upsellPrice', { price: upsellProduct.price })}</p>
                            
                            <div>
                                <label className="block mb-2 text-sm font-medium">{t('uploadPersonalDesignLabel')}</label>
                                <input 
                                    type="file" 
                                    accept="image/svg+xml"
                                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            {customSvgUrl && (
                                <div className="space-y-4 pt-4 border-t border-gray-700">
                                    <h4 className="text-md font-semibold">{t('adjustDesignTitle')}:</h4>
                                    <div>
                                        <label className="block text-sm">{t('positionX')}: {customization.position.x}</label>
                                        <input type="range" min="0" max="100" value={customization.position.x} onChange={(e) => setCustomization(c => ({ ...c, position: { ...c.position, x: parseInt(e.target.value) } }))} className="w-full"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm">{t('positionY')}: {customization.position.y}</label>
                                        <input type="range" min="0" max="100" value={customization.position.y} onChange={(e) => setCustomization(c => ({ ...c, position: { ...c.position, y: parseInt(e.target.value) } }))} className="w-full"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm">{t('sizeZoom')}: {customization.scale}</label>
                                        <input type="range" min="0.5" max="2.5" step="0.05" value={customization.scale} onChange={(e) => setCustomization(c => ({ ...c, scale: parseFloat(e.target.value) }))} className="w-full"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm">{t('rotation')}: {customization.rotation}°</label>
                                        <input type="range" min="0" max="360" value={customization.rotation} onChange={(e) => setCustomization(c => ({ ...c, rotation: parseInt(e.target.value) }))} className="w-full"/>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center gap-4 pt-4">
                                <button onClick={handleAddUpsellItem} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">{t('addToCartButton')}</button>
                                <button onClick={handleFinalCheckout} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">{t('noThanksButton')}</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}