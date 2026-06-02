import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useData } from '../contexts/DataContext';
import * as api from '../api/api';
import { ShoppingCartIcon, MenuIcon, XIcon, SearchIcon } from './Icons';
import LanguageSwitcher from './LanguageSwitcher';



export default function Navbar() {
    const { t } = useTranslation();
    const { navigate } = useRouter();
    const { isAuthenticated, isAdmin, logout, user } = useAuth();
    const { cartItems } = useCart();
    const { settings } = useSiteSettings();
    const { categories } = useData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const allNavLinks = [
        { name: t('homePage'), page: 'home' },
        { name: t('browseProducts'), page: 'browse' },
        { name: t('realLifeGalleryTitle') || 'Gallery', page: 'home', params: { scrollTo: 'gallery' } },
        ...categories.map(c => ({ 
            name: c.name, 
            page: 'category', 
            params: { id: c._id } 
        }))
    ];

    const mainLinks = allNavLinks.slice(0, 4);
    const moreLinks = allNavLinks.slice(4);
    
    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('home');
    }

    // Construct the full logo URL
    let finalLogoUrl = settings.logoUrl;
    if (finalLogoUrl && finalLogoUrl.startsWith('/uploads')) {
        finalLogoUrl = `${api.BASE_URL}${finalLogoUrl}`;
    }

    return (
        <nav className="navbar-luxury fixed top-0 z-50 w-full text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24 gap-4">
                    
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0">
                            {finalLogoUrl && (
                            <button onClick={() => navigate('home')} className="cursor-pointer focus:outline-none transition-transform hover:scale-105 duration-300">
                                    <img src={finalLogoUrl} alt="VIPCard Logo" className="h-16 w-auto min-w-[120px] object-contain" />
                                </button>
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <div className="flex flex-wrap items-center gap-6">
                                {mainLinks.map(link => (
                                    <button 
                                        key={link.page === 'home' ? 'home' : (link.params?.id || link.name)} 
                                        onClick={() => navigate(link.page, link.params)} 
                                        className="nav-link-luxury px-1 py-2 text-sm font-semibold transition-colors whitespace-nowrap"
                                    >
                                        {link.name}
                                    </button>
                                ))}
                                {moreLinks.length > 0 && (
                                    <div className="relative group">
                                        <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="nav-link-luxury px-1 py-2 text-sm font-semibold flex items-center gap-1">
                                            {t('more')}
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                        {isMoreMenuOpen && (
                                            <div className="absolute start-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-2xl py-2 z-20">
                                                {moreLinks.map(link => (
                                                    <button key={link.params?.id || link.name} onClick={() => {navigate(link.page, link.params); setIsMoreMenuOpen(false);}} className="block w-full text-right px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-gold transition-colors">{link.name}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4">
                            
                            <LanguageSwitcher />

                            <button onClick={() => navigate('search')} className="relative p-2 rounded-full hover:bg-gray-800 transition-colors focus:outline-none">
                                <SearchIcon />
                            </button>
                            {isAuthenticated ? (
                                <div className="flex flex-col items-center justify-center -mt-2">
                                    <span className="px-3 py-1 text-sm font-bold gold-gradient-text">
                                        {t('hello')}, {user.name}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => navigate('profile')} className="text-xs text-gray-300 hover:text-gold-500 transition-colors">{t('myProfile')}</button>
                                        <span className="text-gray-600 text-xs">|</span>
                                        <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 transition-colors">{t('logout')}</button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => navigate('login')} 
                                    className="btn-premium btn-gold py-1.5 px-6 text-xs whitespace-nowrap"
                                >
                                    {t('loginRegister')}
                                </button>
                            )}
                            
                            {isAdmin && (
                                <button 
                                    onClick={() => navigate('admin')} 
                                    className="btn-premium btn-obsidian py-1.5 px-6 text-xs whitespace-nowrap"
                                >
                                    {t('adminPanel')}
                                </button>
                            )}

                            <button onClick={() => navigate('cart')} className="relative p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-all focus:outline-none shadow-inner border border-gray-700">
                                <ShoppingCartIcon />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-black shadow-lg border border-gray-900">{cartItemCount}</span>
                                )}
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2 md:hidden">
                            <button onClick={() => navigate('search')} className="p-2 text-gray-400 hover:text-white">
                                <SearchIcon />
                            </button>
                            <button onClick={() => navigate('cart')} className="relative p-2 text-gray-400 hover:text-white">
                                <ShoppingCartIcon />
                                {cartItemCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                                )}
                            </button>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} type="button" className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-colors">
                                {isMenuOpen ? <XIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {isMenuOpen && (
                <div className="md:hidden bg-gray-900 border-t border-gray-800 shadow-2xl">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {allNavLinks.map(link => (
                            <button key={link.name} onClick={() => { navigate(link.page, link.params); setIsMenuOpen(false); }} className="text-gray-300 hover:bg-gray-800 hover:text-gold-500 block w-full text-right px-4 py-3 rounded-lg text-base font-medium transition-all">{link.name}</button>
                        ))}
                        {isAdmin && (
                            <button onClick={() => { navigate('admin'); setIsMenuOpen(false); }} className="text-indigo-300 bg-indigo-900 bg-opacity-20 border border-indigo-800 block w-full text-right px-4 py-3 rounded-lg text-base font-bold transition-all uppercase tracking-widest mt-4">{t('adminPanel')}</button>
                        )}
                        <div className="pt-4 flex justify-between items-center px-4">
                            <LanguageSwitcher />
                        </div>
                    </div>
                    <div className="pt-4 pb-8 border-t border-gray-800">
                        {isAuthenticated ? (
                            <div className="px-4 space-y-2">
                                <div className="flex items-center px-4 py-3 bg-gray-800 rounded-xl mb-4">
                                    <div className="ms-3 flex-grow text-right">
                                        <div className="text-lg font-bold text-white">{user.name}</div>
                                        <div className="text-sm text-gray-400">{user.email}</div>
                                    </div>
                                </div>
                                <button onClick={() => {navigate('profile'); setIsMenuOpen(false);}} className="block w-full text-right rounded-lg px-4 py-3 text-base font-medium text-gray-300 hover:bg-gray-800 transition-colors">{t('myProfile')}</button>
                                <button onClick={handleLogout} className="block w-full text-right rounded-lg px-4 py-3 text-base font-medium text-red-400 hover:bg-gray-800 transition-colors">{t('logout')}</button>
                            </div>
                        ) : (
                            <div className="px-4">
                                <button onClick={() => { navigate('login'); setIsMenuOpen(false); }} className="w-full text-center bg-gold-600 text-white block px-4 py-4 rounded-xl text-base font-bold shadow-lg shadow-gold-900/20">{t('loginRegister')}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}