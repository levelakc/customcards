import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import * as api from '../api/api';
import { ShoppingCartIcon, MenuIcon, XIcon, SearchIcon } from './Icons';
import LanguageSwitcher from './LanguageSwitcher';



export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { navigate } = useRouter();
    const { isAuthenticated, isAdmin, logout, user } = useAuth();
    const { cartItems } = useCart();
    const { settings } = useSiteSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cats = await api.getCategories();
                setCategories(cats);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchData();
    }, [i18n.language]);

    const allNavLinks = [
        { name: t('homePage'), page: 'home' },
        ...categories.map(c => ({ 
            name: c.name?.[i18n.language] || c.name?.he || c.name?.en || c.name || '', 
            page: 'category', 
            params: { id: c._id } 
        }))
    ];

    const mainLinks = allNavLinks.slice(0, 6);
    const moreLinks = allNavLinks.slice(6);
    
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
        <nav className="bg-black bg-opacity-50 backdrop-blur-lg fixed top-0 z-50 w-full text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {finalLogoUrl && (
                            <button onClick={() => navigate('home')} className="cursor-pointer focus:outline-none" style={{ marginTop: '20px' }}>
                                    <img src={finalLogoUrl} alt="VIPCard Logo" height="224px" width="224px" />
                                </button>
                            )}
                        </div>
                        <div className="hidden md:block">
                            <div className="mr-10 flex flex-wrap items-center space-x-4">
                                {mainLinks.map(link => (
                                    <button key={link.page === 'home' ? 'home' : link.params.id} onClick={() => navigate(link.page, link.params)} className="hover:bg-gray-700 hover:bg-opacity-50 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap">{link.name}</button>
                                ))}
                                {moreLinks.length > 0 && (
                                    <div className="relative group">
                                        <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="hover:bg-gray-700 hover:bg-opacity-50 px-3 py-2 rounded-md text-sm font-medium">
                                            {t('more')}
                                        </button>
                                        {isMoreMenuOpen && (
                                            <div className="absolute start-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20">
                                                {moreLinks.map(link => (
                                                    <button key={link.params.id} onClick={() => {navigate(link.page, link.params); setIsMoreMenuOpen(false);}} className="block w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">{link.name}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isAdmin && (
                                    <button onClick={() => navigate('admin')} className="border border-indigo-500 hover:bg-indigo-500 hover:bg-opacity-25 px-3 py-2 rounded-md text-sm font-medium transition-colors">{t('adminPanel')}</button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="hidden md:flex items-center">
                            
                            <LanguageSwitcher />

                            <button onClick={() => navigate('search')} className="relative p-2 rounded-full hover:bg-gray-700 hover:bg-opacity-50 focus:outline-none ms-4">
                                <SearchIcon />
                            </button>
                            {isAuthenticated ? (
                                <div className="relative group">
                                    <button className="hover:bg-gray-700 hover:bg-opacity-50 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                                        {t('hello')}, {user.name}
                                    </button>
                                    <div className="absolute start-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button onClick={() => navigate('profile')} className="block w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">{t('myProfile')}</button>
                                        <button onClick={handleLogout} className="block w-full text-right px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">{t('logout')}</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => navigate('login')} className="hover:bg-gray-700 hover:bg-opacity-50 px-3 py-2 rounded-md text-sm font-medium">{t('loginRegister')}</button>
                            )}
                            <button onClick={() => navigate('cart')} className="relative p-2 rounded-full hover:bg-gray-700 hover:bg-opacity-50 focus:outline-none ml-4">
                                <ShoppingCartIcon />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">{cartItemCount}</span>
                                )}
                            </button>
                        </div>
                        
                        <div className="flex items-center md:hidden">
                            <button onClick={() => navigate('search')} className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                                <SearchIcon />
                            </button>
                            <button onClick={() => navigate('cart')} className="relative p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                                <ShoppingCartIcon />
                                {cartItemCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                                )}
                            </button>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} type="button" className="relative inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none">
                                {isMenuOpen ? <XIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {allNavLinks.map(link => (
                            <button key={link.name} onClick={() => { navigate(link.page, link.params); setIsMenuOpen(false); }} className="text-gray-300 hover:bg-gray-700 hover:text-white block w-full text-right px-3 py-2 rounded-md text-base font-medium">{link.name}</button>
                        ))}
                        {isAdmin && (
                            <button onClick={() => { navigate('admin'); setIsMenuOpen(false); }} className="text-gray-300 bg-indigo-600 hover:bg-indigo-700 block w-full text-right px-3 py-2 rounded-md text-base font-medium">{t('adminPanel')}</button>
                        )}
                         <LanguageSwitcher />
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-700">
                        {isAuthenticated ? (
                            <div className="px-2 space-y-1">
                                <div className="flex items-center px-3 mb-2">
                                    <div className="ms-3 flex-grow text-right">
                                        <div className="text-base font-medium leading-none text-white">{user.name}</div>
                                        <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                                    </div>
.                                </div>
                                <button onClick={() => {navigate('profile'); setIsMenuOpen(false);}} className="block w-full text-right rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">{t('myProfile')}</button>
                                <button onClick={handleLogout} className="block w-full text-right rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">{t('logout')}</button>
                            </div>
                        ) : (
                            <div className="px-2">
                                <button onClick={() => { navigate('login'); setIsMenuOpen(false); }} className="w-full text-right text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">{t('loginRegister')}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}