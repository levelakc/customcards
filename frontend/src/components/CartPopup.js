import React, { useEffect, useState } from 'react';
import { useRouter } from '../contexts/RouterContext';

export default function CartPopup({ isVisible, onClose }) {
    const { navigate } = useRouter();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 500);
            }, 5000); 

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const handleNavigate = () => {
        onClose();
        navigate('cart');
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed bottom-5 right-5 z-50 transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="bg-gray-800 text-white rounded-lg shadow-2xl p-4 flex items-center space-x-4 space-x-reverse">
                <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <p className="font-bold">מוצר נוסף לסל!</p>
                    <button onClick={handleNavigate} className="text-sm text-indigo-400 hover:underline">מעבר לקופה</button>
                </div>
            </div>
        </div>
    );
}