import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import * as api from '../api/api';
import AdminOrdersPage from './AdminOrdersPage';
import AdminUsersPage from './AdminUsersPage';
import AdminReviewsPage from './AdminReviewsPage';
import AdminDashboardPage from './AdminDashboardPage';
import CreditCardPreview from '../components/CreditCardPreview';
import WalletPreview from '../components/WalletPreview'; // 1. Import WalletPreview
import { ALL_CARD_COLORS, cardColorOptions } from '../utils/colorUtils';

function SiteSettingsPage() {
    const { t } = useTranslation();
    const { token } = useAuth();
    const { settings, fetchSettings, updateLocalSettings } = useSiteSettings();
    const [localSettings, setLocalSettings] = useState(settings);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleFileUpload = async (e, fileType) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append(fileType, file);
        setUploading(true);
        setMessage('');
        try {
            const uploadFunction = fileType === 'video' ? api.uploadVideoFile : api.uploadFile;
            const uploadResult = await uploadFunction(formData, token);
            
            const key = fileType === 'video' ? 'backgroundVideoUrl' : 'logoUrl';
            const value = uploadResult.video || uploadResult.image;

            await api.updateSiteSettings({ [key]: value }, token);
            updateLocalSettings({ [key]: value });
            setMessage(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} ${t('updatedSuccessfully')}`);
            fetchSettings(); 
        } catch (err) {
            setMessage(`${t('fileUploadError')} ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleUrlUpdate = async (key, value) => {
        try {
            await api.updateSiteSettings({ [key]: value }, token);
            updateLocalSettings({ [key]: value });
            setMessage(`${key} ${t('updatedSuccessfully')}`);
            fetchSettings();
        } catch (err) {
            setMessage(`${t('error')} ${err.message}`);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('siteSettings')}</h2>
            <div className="bg-gray-800 p-6 rounded-lg space-y-6 max-w-lg">
                {message && <p className={message.includes('Error') ? 'text-red-400' : 'text-green-400'}>{message}</p>}
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">{t('siteLogo')}</h3>
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <p>{t('preview')}:</p>
                        {localSettings.logoUrl && <img src={localSettings.logoUrl} alt={t('logoPreviewAlt')} className="h-10 bg-gray-700 p-1 rounded"/>}
                    </div>
                    <div>
                        <label className="block mb-1">{t('uploadNewLogo')}</label>
                        <input 
                            type="file" 
                            accept="image/svg+xml,image/png,image/jpeg" 
                            onChange={(e) => handleFileUpload(e, 'image')} 
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    <div className="text-center text-gray-400">{t('or')}</div>
                    <div>
                        <label className="block mb-1">{t('pasteLogoLink')}</label>
                        <div className="flex gap-2">
                            <input type="text" value={localSettings.logoUrl || ''} onChange={(e) => setLocalSettings(s => ({...s, logoUrl: e.target.value}))} className="w-full bg-gray-700 rounded p-2 border border-gray-600"/>
                            <button type="button" onClick={() => handleUrlUpdate('logoUrl', localSettings.logoUrl)} className="bg-indigo-600 px-4 rounded">{t('save')}</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">{t('backgroundVideo')}</h3>
                    <div>
                        <label className="block mb-1">{t('uploadNewVideo')}</label>
                        <input type="file" accept="video/mp4,video/webm,video/ogg" onChange={(e) => handleFileUpload(e, 'video')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        <p className="text-xs text-gray-400 mt-1">{t('currentVideoLabel')}: {localSettings.backgroundVideoUrl}</p>
                    </div>
                    <div>
                        <label htmlFor="opacity" className="block mb-2 text-sm font-medium">{t('videoOpacity')}: {Math.round((localSettings.videoOpacity || 0) * 100)}%</label>
                        <input id="opacity" type="range" min="0" max="1" step="0.05" value={localSettings.videoOpacity || 0} onChange={(e) => handleUrlUpdate('videoOpacity', parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                    </div>
                </div>

                {uploading && <p>{t('uploadingFile')}...</p>}
            </div>
        </div>
    );
}

function GallerySettingsPage() {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [galleryImages, setGalleryImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const fetchGallery = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await api.getGalleryImages();
            setGalleryImages(data.images || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        setIsUploading(true);
        setError('');

        try {
            const uploadResult = await api.uploadFile(formData, token);
            const newImageUrl = uploadResult.image;
            const updatedImages = [...galleryImages, newImageUrl];
            await api.updateGalleryImages({ images: updatedImages }, token);
            setGalleryImages(updatedImages);
        } catch (err) {
            setError(`${t('fileUploadError')} ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteImage = async (imageUrlToDelete) => {
        if (window.confirm(t('deleteImageConfirmation'))) {
            try {
                const updatedImages = galleryImages.filter(url => url !== imageUrlToDelete);
                await api.updateGalleryImages({ images: updatedImages }, token);
                setGalleryImages(updatedImages);
            } catch (err) {
                setError(`${t('error')} ${err.message}`);
            }
        }
    };

    if (isLoading) return <p>{t('loadingGallery')}...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('manageGallery')}</h2>
            <div className="bg-gray-800 p-6 rounded-lg space-y-6">
                {error && <p className="text-red-400">{error}</p>}
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">{t('uploadNewImage')}</h3>
                    <input 
                        type="file" 
                        accept="image/png,image/jpeg,image/webp" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {isUploading && <p>{t('uploadingImage')}...</p>}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-white">{t('currentImages')}</h3>
                    {galleryImages.length === 0 ? (
                        <p className="text-gray-400">{t('noImages')}</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {galleryImages.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img src={url} alt={t('galleryImageAlt', { index: index + 1 })} className="rounded-lg object-cover w-full h-32" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                        <button 
                                            onClick={() => handleDeleteImage(url)}
                                            className="text-white bg-red-600 hover:bg-red-700 rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            title={t('deleteImage')}
                                        >
                                            {t('delete')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


export default function AdminPage() {
    const { t, i18n } = useTranslation();
    const { isAdmin, token } = useAuth();
    const { navigate } = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image: '', category: '', availableColors: new Set(ALL_CARD_COLORS), isUpsellProduct: false });
    const [categoryName, setCategoryName] = useState('');

    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [customization, setCustomization] = useState({
        position: { x: 45, y: 10 },
        scale: 1,
        rotation: 0,
    });
    const [previewColorKey, setPreviewColorKey] = useState('black');
    useEffect(() => {
        if (selectedFile) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setPreviewUrl(productForm.image);
        }
    }, [selectedFile, productForm.image]);
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const prods = await api.getProducts();
            const cats = await api.getCategories();
            setProducts(prods);
            setCategories(cats);
            if (cats.length > 0) {
                setProductForm(currentForm => ({ ...currentForm, category: currentForm.category || cats[0]._id }));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (isAdmin) {
            fetchData();
        } else {
            navigate('home');
        }
    }, [isAdmin, navigate, fetchData]);
    
    const handleProductInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    const handleColorToggle = (color) => {
        setProductForm(prev => {
            const updatedColors = new Set(prev.availableColors);
            if (updatedColors.has(color)) updatedColors.delete(color);
            else updatedColors.add(color);
            return { ...prev, availableColors: updatedColors };
        });
    };
    
    const resetProductForm = () => {
        setProductForm({ name: '', description: '', price: '', image: '', category: categories[0]?._id || '', availableColors: new Set(ALL_CARD_COLORS), isUpsellProduct: false });
        setCustomization({ position: { x: 45, y: 10 }, scale: 1, rotation: 0 });
        setIsEditing(false);
        setEditingId(null);
        setSelectedFile(null);
    };
    const handleSelectProductToEdit = (product) => {
        setIsEditing(true);
        setEditingId(product._id);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            category: product.category?._id,
            availableColors: new Set(product.availableColors),
            isUpsellProduct: product.isUpsellProduct || false,
        });
        setCustomization(product.customization || { position: { x: 45, y: 10 }, scale: 1, rotation: 0 });
    };
    
    const handleSelectCategoryToEdit = async (categoryId) => {
        setIsEditing(true);
        setEditingId(categoryId);
        try {
            const categoryToEdit = await api.getCategoryById(categoryId, token);
            setCategoryName(categoryToEdit.name);
        } catch (err) {
            alert(`${t('error')} ${err.message}`);
        }
    };
    const resetCategoryForm = () => {
        setCategoryName('');
        setIsEditing(false);
        setEditingId(null);
    };
    
    const handleProductFormSubmit = async (e) => {
        e.preventDefault();
        let imageUrl = productForm.image;
        if (selectedFile) {
            const formData = new FormData();
            formData.append('image', selectedFile);
            setUploading(true);
            try {
                const uploadResult = await api.uploadFile(formData, token);
                imageUrl = uploadResult.image;
            } catch (err) {
                alert(`${t('fileUploadError')} ${err.message}`);
                setUploading(false);
                return;
            }
            setUploading(false);
        }
        if (!imageUrl) {
            alert(t('provideLogoLink'));
            return;
        }
        const productData = { 
            ...productForm, 
            image: imageUrl, 
            price: Number(productForm.price), 
            availableColors: Array.from(productForm.availableColors),
            customization: customization,
        };
        
        try {
            if (isEditing) {
                await api.updateProduct(editingId, productData, token); 
            }
            else {
                await api.addProduct(productData, token);
            }
            resetProductForm();
            fetchData();
        } catch (err) {
            alert(`${t('error')} ${err.message}. ${err.response?.data?.message || ''}`);
        }
    };
    const handleDeleteProduct = async (productId) => {
        if (window.confirm(t('deleteProductConfirmation'))) {
            try {
                await api.deleteProduct(productId, token);
                fetchData();
            } catch (err) {
                alert(`${t('error')} ${err.message}`);
            }
        }
    };
    const handleCategoryFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.updateCategory(editingId, { name: categoryName }, token);
            } else {
                await api.addCategory({ name: categoryName }, token);
            }
            window.location.reload();
        } catch (err) {
            alert(`${t('error')} ${err.message}`);
        }
    };
    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm(t('deleteCategoryConfirmation'))) {
            try {
                await api.deleteCategory(categoryId, token);
                window.location.reload();
            } catch (err) {
                alert(`${t('error')} ${err.message}`);
            }
        }
    };
    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">{t('loadingData')}...</div>;
    if (error) return <div className="text-center p-10 text-red-400 bg-gray-900 min-h-screen">{t('error')} {error}</div>;
    return (
      <div className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold font-dancing">{t('adminPanel')}</h1>
        </div>
        <div className="flex flex-wrap space-x-4 space-x-reverse border-b border-gray-700 mb-8">
            <button type="button" onClick={() => setActiveTab('dashboard')} className={`py-2 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>{t('dashboard')}</button>
            <button type="button" onClick={() => setActiveTab('products')} className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>{t('productManagement')}</button>
            <button type="button" onClick={() => setActiveTab('categories')} className={`py-2 px-4 ${activeTab === 'categories' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>{t('categoryManagement')}</button>
            <button type="button" onClick={() => setActiveTab('gallery')} className={`py-2 px-4 ${activeTab === 'gallery' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>{t('imageGallery')}</button>
            <button type="button" onClick={() => setActiveTab('orders')} className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>{t('orderManagement')}</button>
            <button type="button" onClick={() => setActiveTab('users')} className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>{t('userManagement')}</button>
            <button type="button" onClick={() => setActiveTab('reviews')} className={`py-2 px-4 ${activeTab === 'reviews' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>{t('reviewManagement')}</button>
            <button type="button" onClick={() => setActiveTab('settings')} className={`py-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>{t('siteSettings')}</button>
        </div>
        {activeTab === 'dashboard' && <AdminDashboardPage />}
        {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">{t('productList')}</h2>
                    <div className="bg-gray-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700"><tr><th scope="col" className="px-6 py-3">{t('productName')}</th><th scope="col" className="px-6 py-3 hidden md:table-cell">{t('category')}</th><th scope="col" className="px-6 py-3">{t('price')}</th><th scope="col" className="px-6 py-3">{t('actions')}</th></tr></thead>
                            <tbody>{products.map(p => (<tr key={p._id} className="border-b border-gray-700 hover:bg-gray-600"><th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{p.name}</th><td className="px-6 py-4 hidden md:table-cell">{p.category?.name}</td><td className="px-6 py-4">₪{p.price}</td><td className="px-6 py-4 space-x-2 space-x-reverse"><button type="button" onClick={() => handleSelectProductToEdit(p)} className="font-medium text-blue-500 hover:underline">{t('edit')}</button><button type="button" onClick={() => handleDeleteProduct(p._id)} className="font-medium text-red-500 hover:underline">{t('delete')}</button></td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">{isEditing ? t('editProduct') : t('addNewProduct')}</h2>
                    
                    <form onSubmit={handleProductFormSubmit}>
                        <div className="mb-6 p-4 bg-gray-900 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2 text-center">{t('preview')}</h3>
                            
                            {!productForm.isUpsellProduct && (
                                <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
                                    <span className="text-sm font-medium">{t('previewColor')}:</span>
                                    {Object.keys(cardColorOptions).map(colorKey => (
                                        <button
                                            key={colorKey}
                                            type="button"
                                            onClick={() => setPreviewColorKey(colorKey)}
                                            className={`px-2 py-1 text-xs rounded ${previewColorKey === colorKey ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                                        >
                                            {t(cardColorOptions[colorKey].nameKey)}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {productForm.isUpsellProduct ? (
                                <WalletPreview
                                    customSvgUrl={previewUrl}
                                    svgPosition={customization.position}
                                    svgScale={customization.scale}
                                    svgRotation={customization.rotation}
                                />
                            ) : (
                                <CreditCardPreview
                                    cardColorKey={previewColorKey}
                                    engravingColor="silver"
                                    logoUrl={previewUrl}
                                    position={customization.position}
                                    scale={customization.scale}
                                    rotation={customization.rotation}
                                    onPositionChange={(pos) => setCustomization(c => ({ ...c, position: pos }))}
                                    onScaleChange={(scale) => setCustomization(c => ({ ...c, scale: scale }))}
                                    onRotationChange={(rotation) => setCustomization(c => ({ ...c, rotation: rotation }))}
                                    isDraggable={true}
                                    showTransformHandles={true}
                                />
                            )}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-semibold">{t('customizeDesign')}</h3>
                                <p className="text-sm text-gray-400">{t('customizeDesignDescription')}</p>
                                
                                <div>
                                    <label htmlFor="scale-slider" className="block text-sm font-medium mb-1">
                                        {t('size')} {customization.scale.toFixed(2)}x
                                    </label>
                                    <input
                                        id="scale-slider"
                                        type="range"
                                        min="0.25"
                                        max="4"
                                        step="0.01"
                                        value={customization.scale}
                                        onChange={(e) => setCustomization(c => ({ ...c, scale: parseFloat(e.target.value) }))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="rotation-slider" className="block text-sm font-medium mb-1">
                                        {t('rotation')} {Math.round(customization.rotation)}°
                                    </label>
                                    <input
                                        id="rotation-slider"
                                        type="range"
                                        min="0"
                                        max="360"
                                        step="1"
                                        value={customization.rotation}
                                        onChange={(e) => setCustomization(c => ({ ...c, rotation: parseFloat(e.target.value) }))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                                    />
                                </div>
                                
                            </div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                            <div><label className="block mb-1">{t('productName')}</label><input type="text" name="name" value={productForm.name} onChange={handleProductInputChange} required className="w-full bg-gray-700 rounded p-2 border border-gray-600"/></div>
                            <div><label className="block mb-1">{t('description')}</label><textarea name="description" value={productForm.description} onChange={handleProductInputChange} required className="w-full bg-gray-700 rounded p-2 border border-gray-600 h-24"/></div>
                            <div><label className="block mb-1">{t('priceILS')}</label><input type="number" name="price" value={productForm.price} onChange={handleProductInputChange} required className="w-full bg-gray-700 rounded p-2 border border-gray-600"/></div>
                            
                            <div>
                                <label className="block mb-1">{t('uploadSVG_PNG')}</label>
                                <input 
                                    type="file" 
                                    accept="image/svg+xml,image/png,image/jpeg"
                                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                            <div className="text-center text-gray-400">{t('or')}</div>
                            <div>
                                <label className="block mb-1">{t('pasteLinkToFile')}</label>
                                <input type="text" name="image" value={productForm.image} onChange={handleProductInputChange} placeholder={t('pasteLogoLink')} className="w-full bg-gray-700 rounded p-2 border border-gray-600"/>
                            </div>
                            
                            
                            <div><label className="block mb-1">{t('category')}</label><select name="category" value={productForm.category} onChange={handleProductInputChange} className="w-full bg-gray-700 rounded p-2 border border-gray-600">{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                            
                            <div className="flex items-center pt-2">
                                <input 
                                    id="isUpsellProduct"
                                    type="checkbox" 
                                    name="isUpsellProduct"
                                    checked={productForm.isUpsellProduct} 
                                    onChange={handleProductInputChange}
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="isUpsellProduct" className="mr-2 text-sm font-medium text-gray-300">{t('isUpsell')}</label>
                            </div>
                            {!productForm.isUpsellProduct && (
                                <div>
                                    <label className="block mb-1">{t('availableCardColors')}</label>
                                    <div className="grid grid-cols-2 gap-2 bg-gray-700 p-2 rounded">
                                        {ALL_CARD_COLORS.map(color => (
                                            <label key={color} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={productForm.availableColors.has(color)} 
                                                    onChange={() => handleColorToggle(color)} 
                                                    className="form-checkbox bg-gray-600 border-gray-500"
                                                />
                                                <span>{t(color)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button type="submit" disabled={uploading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
                                {uploading ? t('uploadingFile') : (isEditing ? t('updateProduct') : t('addProduct'))}
                            </button>
                            {isEditing && <button type="button" onClick={resetProductForm} className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">{t('cancelEdit')}</button>}
                        </div>
                    </form>
                </div>
            </div>
        )}
        {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">{t('categoryList')}</h2>
                    <div className="bg-gray-800 rounded-lg">
                                                    <ul className="divide-y divide-gray-700">{categories.map(c => <li key={c._id} className="p-4 flex justify-between items-center"><span>{c.name}</span><div className="space-x-2 space-x-reverse"><button type="button" onClick={() => handleSelectCategoryToEdit(c._id)} className="font-medium text-blue-500 hover:underline">{t('edit')}</button><button type="button" onClick={() => handleDeleteCategory(c._id)} className="font-medium text-red-500 hover:underline">{t('delete')}</button></div></li>)}</ul>                    </div>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">{isEditing ? t('editCategory') : t('addNewCategory')}</h2>
                    <form onSubmit={handleCategoryFormSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
                        <div><label className="block mb-1">{t('categoryName')}</label><input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required className="w-full bg-gray-700 rounded p-2 border border-gray-600"/></div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">{isEditing ? t('updateCategory') : t('addCategory')}</button>
                        {isEditing && <button type="button" onClick={resetCategoryForm} className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">{t('cancelEdit')}</button>}
                    </form>
                </div>
            </div>
        )}
        
        {activeTab === 'gallery' && <GallerySettingsPage />}
        {activeTab === 'orders' && <AdminOrdersPage />}
        {activeTab === 'users' && <AdminUsersPage />}
        {activeTab === 'reviews' && <AdminReviewsPage />}
        {activeTab === 'settings' && <SiteSettingsPage />}
      </div>
    );
}