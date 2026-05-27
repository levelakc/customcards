import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';

export default function PrizeWheelModal({ onClose }) {
    const { t } = useTranslation();
    const { settings } = useSiteSettings();
    const { user } = useAuth();
    const { navigate } = useRouter();
    
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinRotation, setSpinRotation] = useState(0);
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const wheelRef = useRef(null);

    // Fallback prizes if none configured
    const defaultPrizes = [
        { label: "10% OFF", discount: 10, probability: 50 },
        { label: "20% OFF", discount: 20, probability: 30 },
        { label: "30% OFF", discount: 30, probability: 10 },
        { label: "50% OFF", discount: 50, probability: 5 },
        { label: "NO LUCK", discount: 0, probability: 5 }
    ];

    const prizes = settings?.wheelPrizes && settings.wheelPrizes.length > 0 
        ? settings.wheelPrizes 
        : defaultPrizes;

    const numSegments = prizes.length;
    const segmentAngle = 360 / numSegments;

    const spinWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setShowResult(false);
        setResult(null);

        // Calculate random winner based on probability
        const random = Math.random() * 100;
        let cumulativeProbability = 0;
        let winningIndex = 0;

        for (let i = 0; i < prizes.length; i++) {
            cumulativeProbability += prizes[i].probability;
            if (random <= cumulativeProbability) {
                winningIndex = i;
                break;
            }
        }

        const winner = prizes[winningIndex];

        // Calculate rotation needed to land on the winning segment
        // The top is 270 degrees in SVG coordinates usually, but let's assume top is 0 rotation and marker is at top
        // To make segment X end up at top, we rotate by: 360 - (X * segmentAngle + segmentAngle / 2)
        const baseSpins = 5; // 5 full spins minimum
        const targetRotation = (360 - (winningIndex * segmentAngle + segmentAngle / 2)) + (baseSpins * 360);
        
        // Add a tiny random offset so it doesn't land perfectly in the center every time
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
        const finalRotation = spinRotation + targetRotation + randomOffset - (spinRotation % 360);

        setSpinRotation(finalRotation);

        // Wait for animation to finish (e.g., 5 seconds)
        setTimeout(() => {
            setIsSpinning(false);
            setResult(winner);
            setShowResult(true);
        }, 5000);
    };

    const handleClaim = () => {
        if (!user) {
            onClose();
            navigate('login');
        } else {
            // Generate or display code
            alert(`Your promo code is: WIN${result.discount}VIP`);
            onClose();
        }
    };

    // Helper to generate a slice of the SVG pie
    const createSlice = (index) => {
        const startAngle = index * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        const largeArcFlag = segmentAngle > 180 ? 1 : 0;
        
        // Convert polar coordinates to cartesian
        const startX = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
        const startY = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
        const endX = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
        const endY = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

        const pathData = [
            `M 50 50`,
            `L ${startX} ${startY}`,
            `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `Z`
        ].join(' ');

        // Alternating colors
        const colors = ['#d4af37', '#1f2937', '#fcf6ba', '#4b5563', '#b38728'];
        const fill = colors[index % colors.length];
        const textColor = (fill === '#d4af37' || fill === '#fcf6ba' || fill === '#b38728') ? '#000' : '#fff';

        // Text positioning
        const midAngle = startAngle + segmentAngle / 2;
        const textRadius = 35;
        const textX = 50 + textRadius * Math.cos(Math.PI * midAngle / 180);
        const textY = 50 + textRadius * Math.sin(Math.PI * midAngle / 180);

        return (
            <g key={index}>
                <path d={pathData} fill={fill} stroke="#fff" strokeWidth="0.5" />
                <text 
                    x={textX} 
                    y={textY} 
                    fill={textColor} 
                    fontSize="4" 
                    fontWeight="bold" 
                    textAnchor="middle" 
                    alignmentBaseline="middle"
                    transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                >
                    {prizes[index].label}
                </text>
            </g>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gold-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <h2 dir="auto" className="text-3xl font-bold gold-gradient-text text-center mb-6">
                    {t('spinToWin') || 'Spin to Win!'}
                </h2>

                {!showResult ? (
                    <div className="relative w-64 h-64 mx-auto mb-8">
                        {/* The Wheel */}
                        <div 
                            ref={wheelRef}
                            className="w-full h-full rounded-full transition-transform"
                            style={{ 
                                transform: `rotate(${spinRotation}deg)`, 
                                transitionDuration: isSpinning ? '5s' : '0s',
                                transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' 
                            }}
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                                {prizes.map((_, i) => createSlice(i))}
                                <circle cx="50" cy="50" r="5" fill="#111" stroke="#d4af37" strokeWidth="1" />
                            </svg>
                        </div>
                        
                        {/* Pointer */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8">
                            <svg viewBox="0 0 24 24" fill="#d4af37" className="w-8 h-8 drop-shadow-md transform rotate-180">
                                <path d="M12 2L2 22h20L12 2z" />
                            </svg>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-5xl mb-4">🎁</div>
                        <h3 className="text-2xl font-bold text-white mb-2">{result.label}</h3>
                        {result.discount > 0 ? (
                            <p className="text-gray-300 mb-6">
                                {user 
                                    ? t('hereIsYourCode') || 'Here is your promo code!' 
                                    : t('loginToClaimPrize') || 'Log in or register to claim your promo code!'}
                            </p>
                        ) : (
                            <p className="text-gray-300 mb-6">{t('betterLuckNextTime') || 'Better luck next time!'}</p>
                        )}
                    </div>
                )}

                <div className="text-center">
                    {!showResult ? (
                        <button 
                            onClick={spinWheel}
                            disabled={isSpinning}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isSpinning ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gold-500 text-black hover:bg-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.4)]'}`}
                        >
                            {isSpinning ? (t('spinning') || 'Spinning...') : (t('spinNow') || 'SPIN NOW')}
                        </button>
                    ) : (
                        result.discount > 0 ? (
                            <button 
                                onClick={handleClaim}
                                className="w-full py-4 rounded-xl font-bold text-lg bg-gold-500 text-black hover:bg-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
                            >
                                {user ? (t('claimPrize') || 'Claim Promo Code') : (t('loginToClaim') || 'Login / Register to Claim')}
                            </button>
                        ) : (
                            <button 
                                onClick={onClose}
                                className="w-full py-4 rounded-xl font-bold text-lg bg-gray-700 text-white hover:bg-gray-600 transition-all"
                            >
                                {t('close') || 'Close'}
                            </button>
                        )
                    )}
                </div>
                
            </div>
        </div>
    );
}
