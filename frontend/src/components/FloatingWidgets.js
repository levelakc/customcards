import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useTranslation } from 'react-i18next';
import PrizeWheelModal from './PrizeWheelModal'; // We will create this next

export default function FloatingWidgets() {
    const { navigate } = useRouter();
    const { t } = useTranslation();
    const [isWheelOpen, setIsWheelOpen] = useState(false);

    const phoneNumber = "972512345678"; // Use international format without '+' or '0'
    const message = "שלום, הגעתי דרך אתר VIPCard.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <>
            <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-4 items-center">
                
                {/* Prize Wheel Button */}
                <button 
                    onClick={() => setIsWheelOpen(true)}
                    className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white rounded-full p-3 shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-transform transform hover:scale-110 border border-yellow-200"
                    title={t('spinToWin') || 'Spin to Win!'}
                >
                    <div className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </div>
                    {/* Wheel Icon */}
                    <svg className="w-8 h-8 text-black opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </button>

                {/* Accessibility Button */}
                <button 
                    onClick={() => navigate('accessibility')}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-110"
                    title={t('accessibility') || 'Accessibility'}
                >
                    {/* Accessibility Icon (Universal Access) */}
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 6c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm2.5 5h-5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5h.5v5c0 .552.448 1 1 1s1-.448 1-1v-5h.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5z"/>
                    </svg>
                </button>

                {/* WhatsApp Button */}
                <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-lg transition-transform transform hover:scale-110"
                    title="WhatsApp"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.433-9.894-9.896-9.894-5.459 0-9.885 4.434-9.888 9.894-.001 2.225.651 4.318 1.841 6.033l-1.225 4.485 4.574-1.21z"/>
                    </svg>
                </a>
            </div>

            {/* Render Prize Wheel Modal when open */}
            {isWheelOpen && (
                <PrizeWheelModal onClose={() => setIsWheelOpen(false)} />
            )}
        </>
    );
}
