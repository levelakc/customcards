import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import CreditCardPreview from '../components/CreditCardPreview';
import Modal from '../components/Modal';

const sideItem = {
    _id: 'side-item-wallet',
    name: 'ארנק מתכת יוקרתי',
    price: 149,
    image: 'https://placehold.co/600x400/555/FFF?text=ארנק+מתכת',
    availableColors: ['black'],
};

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, addToCart } = useCart();
    const { navigate } = useRouter();
    const { user } = useAuth();
    const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleProceedToCheckout = () => {
        if (!user) {
            navigate('login');
            return;
        }
        setIsUpsellModalOpen(true);
    };

    const handleFinalCheckout = () => {
        setIsUpsellModalOpen(false);
        navigate('checkout'); // Navigate to the new checkout page
    };

    const handleAddSideItem = () => {
        addToCart(sideItem, 1, 'black');
        handleFinalCheckout();
    };

    if (cartItems.length === 0) { /* ... (no change) ... */ }

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold mb-8">סל הקניות שלך</h1>
                <div className="bg-gray-800 rounded-lg shadow-xl">
                    <ul className="divide-y divide-gray-700">
                        {cartItems.map(item => (
                            <li key={item.cartItemId} className="p-4 sm:p-6 flex items-center space-x-4 space-x-reverse">
                                <div className="w-32 h-auto flex-shrink-0">
                                    <CreditCardPreview
                                        cardColor={item.selectedColor?.split(' ')[0].toLowerCase() || 'black'}
                                        engravingColor={item.selectedColor?.split(' ')[2] || 'silver'}
                                        logoUrl={item.image}
                                        isDraggable={false}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h2 className="text-lg sm:text-xl font-bold">{item.name}</h2>
                                    <p className="text-sm text-gray-400">צבע: {item.selectedColor}</p>
                                    <p className="text-lg font-semibold text-indigo-400 mt-1">₪{item.price}</p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                     <div className="flex items-center border border-gray-600 rounded-md">
                                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="px-3 py-1 text-lg">-</button>
                                        <span className="px-3 py-1 text-lg">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="px-3 py-1 text-lg">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.cartItemId)} className="text-xs text-red-500 hover:underline">הסר</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="p-6 border-t border-gray-700">
                        <div className="flex justify-between items-center text-xl font-bold mb-4">
                            <span>סך הכל:</span>
                            <span>₪{subtotal.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleProceedToCheckout} 
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg"
                        >
                            המשך לתשלום
                        </button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isUpsellModalOpen} onClose={handleFinalCheckout} title="רגע לפני שמסיימים...">
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">אולי תרצה להוסיף גם ארנק מתכת תואם?</h3>
                    <img src={sideItem.image} alt={sideItem.name} className="w-64 mx-auto rounded-lg mb-4" />
                    <p className="text-lg font-semibold mb-6">רק ב-₪{sideItem.price}!</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={handleAddSideItem} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">כן, הוסף בבקשה</button>
                        <button onClick={handleFinalCheckout} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">לא, תודה</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}