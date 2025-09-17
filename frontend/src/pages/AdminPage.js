import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import * as api from '../api/api';
import AdminOrdersPage from './AdminOrdersPage';
import AdminUsersPage from './AdminUsersPage';
import AdminDashboardPage from './AdminDashboardPage';
import CreditCardPreview from '../components/CreditCardPreview';
import WalletPreview from '../components/WalletPreview'; // 1. Import WalletPreview
import { ALL_CARD_COLORS } from '../utils/colorUtils';

function SiteSettingsPage() {
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
            setMessage(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} updated successfully!`);
            fetchSettings(); 
        } catch (err) {
            setMessage(`Upload Error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleUrlUpdate = async (key, value) => {
        try {
            await api.updateSiteSettings({ [key]: value }, token);
            updateLocalSettings({ [key]: value });
            setMessage(`${key} updated successfully!`);
            fetchSettings();
        } catch (err) {
            setMessage(`Update Error: ${err.message}`);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">הגדרות אתר</h2>
            <div className="bg-gray-800 p-6 rounded-lg space-y-6 max-w-lg">
                {message && <p className={message.includes('Error') ? 'text-red-400' : 'text-green-400'}>{message}</p>}
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">לוגו אתר</h3>
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <p>תצוגה מקדימה:</p>
                        {localSettings.logoUrl && <img src={localSettings.logoUrl} alt="Logo Preview" className="h-10 bg-gray-700 p-1 rounded"/>}
                    </div>
                    <div>
                        <label className="block mb-1">העלה לוגו חדש (SVG, PNG, JPG)</label>
                        <input 
                            type="file" 
                            accept="image/svg+xml,image/png,image/jpeg" 
                            onChange={(e) => handleFileUpload(e, 'image')} 
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                    </div>
                    <div className="text-center text-gray-400">או</div>
                    <div>
                        <label className="block mb-1">הדבק קישור ללוגו</label>
                        <div className="flex gap-2">
                            <input type="text" value={localSettings.logoUrl || ''} onChange={(e) => setLocalSettings(s => ({...s, logoUrl: e.target.value}))} className="w-full bg-gray-700 rounded p-2 border border-gray-600"/>
                            <button type="button" onClick={() => handleUrlUpdate('logoUrl', localSettings.logoUrl)} className="bg-indigo-600 px-4 rounded">שמור</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">וידאו רקע</h3>
                    <div>
                        <label className="block mb-1">העלה וידאו רקע חדש</label>
                        <input type="file" accept="video/mp4,video/webm,video/ogg" onChange={(e) => handleFileUpload(e, 'video')} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        <p className="text-xs text-gray-400 mt-1">וידאו נוכחי: {localSettings.backgroundVideoUrl}</p>
                    </div>
                    <div>
                        <label htmlFor="opacity" className="block mb-2 text-sm font-medium">שקיפות הוידאו: {Math.round((localSettings.videoOpacity || 0) * 100)}%</label>
                        <input id="opacity" type="range" min="0" max="1" step="0.05" value={localSettings.videoOpacity || 0} onChange={(e) => handleUrlUpdate('videoOpacity', parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                    </div>
                </div>

                {uploading && <p>מעלה קובץ...</p>}
            </div>
        </div>
    );
}

function GallerySettingsPage() {
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
            setError(`Upload Error: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteImage = async (imageUrlToDelete) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק תמונה זו?')) {
            try {
                const updatedImages = galleryImages.filter(url => url !== imageUrlToDelete);
                await api.updateGalleryImages({ images: updatedImages }, token);
                setGalleryImages(updatedImages);
            } catch (err) {
                setError(`Delete Error: ${err.message}`);
            }
        }
    };

    if (isLoading) return <p>טוען גלריה...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">ניהול גלריית תמונות מהשטח</h2>
            <div className="bg-gray-800 p-6 rounded-lg space-y-6">
                {error && <p className="text-red-400">{error}</p>}
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">העלאת תמונה חדשה</h3>
                    <input 
                        type="file" 
                        accept="image/png,image/jpeg,image/webp" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {isUploading && <p>מעלה תמונה...</p>}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-white">תמונות נוכחיות</h3>
                    {galleryImages.length === 0 ? (
                        <p className="text-gray-400">טרם הועלו תמונות.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {galleryImages.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img src={url} alt={`Gallery image ${index + 1}`} className="rounded-lg object-cover w-full h-32" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                        <button 
                                            onClick={() => handleDeleteImage(url)}
                                            className="text-white bg-red-600 hover:bg-red-700 rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="מחק תמונה"
                                        >
                                            X
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
        position: { x: 50, y: 50 },
        scale: 1,
        rotation: 0,
    });

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
        setCustomization({ position: { x: 50, y: 50 }, scale: 1, rotation: 0 });
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
        setCustomization(product.customization || { position: { x: 50, y: 50 }, scale: 1, rotation: 0 });
    };
    
    const handleSelectCategoryToEdit = (category) => {
        setIsEditing(true);
        setEditingId(category._id);
        setCategoryName(category.name);
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
                alert(`שגיאת העלאת קובץ: ${err.message}`);
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        if (!imageUrl) {
            alert('אנא ספק קישור ללוגו או העלה קובץ.');
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
            alert(`שגיאה: ${err.message}`);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את המוצר?')) {
            try {
                await api.deleteProduct(productId, token);
                fetchData();
            } catch (err) {
                alert(`שגיאה: ${err.message}`);
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
            alert(`שגיאה: ${err.message}`);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('האם אתה בטוח? פעולה זו תמחק גם את כל המוצרים בקטגוריה זו.')) {
            try {
                await api.deleteCategory(categoryId, token);
                window.location.reload();
            } catch (err) {
                alert(`שגיאה: ${err.message}`);
            }
        }
    };

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">טוען נתונים...</div>;
    if (error) return <div className="text-center p-10 text-red-400 bg-gray-900 min-h-screen">שגיאה: {error}</div>;

    return (
      <div className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
        <h1 className="text-4xl font-extrabold mb-8">פאנל ניהול</h1>
        <div className="flex flex-wrap space-x-4 space-x-reverse border-b border-gray-700 mb-8">
            <button type="button" onClick={() => setActiveTab('dashboard')} className={`py-2 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>Dashboard</button>
            <button type="button" onClick={() => setActiveTab('products')} className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>ניהול מוצרים</button>
            <button type="button" onClick={() => setActiveTab('categories')} className={`py-2 px-4 ${activeTab === 'categories' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>ניהול קטגוריות</button>
            <button type="button" onClick={() => setActiveTab('gallery')} className={`py-2 px-4 ${activeTab === 'gallery' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>גלריית תמונות</button>
            <button type="button" onClick={() => setActiveTab('orders')} className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>ניהול הזמנות</button>
            <button type="button" onClick={() => setActiveTab('users')} className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>ניהול משתמשים</button>
            <button type="button" onClick={() => setActiveTab('settings')} className={`py-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-indigo-500' : 'text-gray-400'}`}>הגדרות אתר</button>
        </div>

        {activeTab === 'dashboard' && <AdminDashboardPage />}

        {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">רשימת מוצרים</h2>
                    <div className="bg-gray-800 rounded-lg overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700"><tr><th scope="col" className="px-6 py-3">שם המוצר</th><th scope="col" className="px-6 py-3 hidden md:table-cell">קטגוריה</th><th scope="col" className="px-6 py-3">מחיר</th><th scope="col" className="px-6 py-3">פעולות</th></tr></thead>
                            <tbody>{products.map(p => (<tr key={p._id} className="border-b border-gray-700 hover:bg-gray-600"><th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{p.name}</th><td className="px-6 py-4 hidden md:table-cell">{p.category?.name}</td><td className="px-6 py-4">₪{p.price}</td><td className="px-6 py-4 space-x-2 space-x-reverse"><button type="button" onClick={() => handleSelectProductToEdit(p)} className="font-medium text-blue-500 hover:underline">ערוך</button><button type="button" onClick={() => handleDeleteProduct(p._id)} className="font-medium text-red-500 hover:underline">מחק</button></td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">{isEditing ? 'עריכת מוצר' : 'הוסף מוצר חדש'}</h2>
                    
                    <div className="mb-6 p-4 bg-gray-900 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-center">תצוגה מקדימה</h3>
                        {/* THE FIX: Conditional rendering for the preview */}
                        {productForm.isUpsellProduct ? (
                            <WalletPreview
                                customSvgUrl={previewUrl}
                                svgPosition={customization.position}
                                svgScale={customization.scale}
                                svgRotation={customization.rotation}
                            />
                        ) : (
                            <CreditCardPreview
                                cardColor="black"
                                engravingColor="silver"
                                logoUrl={previewUrl}
                                position={customization.position}
                                scale={customization.scale}
                                rotation={customization.rotation}
                                onPositionChange={(pos) => setCustomization(c => ({ ...c, position: pos }))}
                                isDraggable={true}
                            />
                        )}
                    </div>

                    <form onSubmit={handleProductFormSubmit}>
                        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                            <div><label className="block mb-1">שם המוצר</label><input type="text" name="name" value={productForm.name} onChange={handleProductInputChange} required className="w-full bg-gray-700 rounded p-2 border border-gray-600"/></div>
                            <div><label className="block mb-1">תיאור</label><textarea name="description" value={productForm.description} onChange={handleProductInputChange} required className="w-full bg-gray-700 rounded p-2 border border-gray-600 h-24"/></div>
                            <div><label className="block mb-1">מחיר (₪)</label><input type="number" name="price" value={productForm.price} onChange={handleProductInputChange} required className="w-full bg-gray-700 rounded p-2 border border-gray-600"/></div>
                            
                            <div>
                                <label className="block mb-1">העלה קובץ SVG או PNG</label>
                                <input 
                                    type="file" 
                                    accept="image/svg+xml,image/png,image/jpeg"
                                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                            <div className="text-center text-gray-400">או</div>
                            <div>
                                <label className="block mb-1">הדבק קישור לקובץ</label>
                                <input type="text" name="image" value={productForm.image} onChange={handleProductInputChange} placeholder="https://example.com/logo.svg" className="w-full bg-gray-700 rounded p-2 border border-gray-600"/>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-gray-700">
                                <h3 className="text-lg font-semibold">התאם את העיצוב</h3>
                                <div>
                                    <label htmlFor="scale" className="block mb-2 text-sm font-medium">גודל (זום):</label>
                                    <input id="scale" type="range" min="0.5" max="2.5" step="0.05" value={customization.scale} onChange={(e) => setCustomization(c => ({ ...c, scale: parseFloat(e.target.value) }))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                                </div>
                                <div>
                                    <label htmlFor="rotation" className="block mb-2 text-sm font-medium">סיבוב:</label>
                                    <input id="rotation" type="range" min="0" max="360" step="1" value={customization.rotation} onChange={(e) => setCustomization(c => ({ ...c, rotation: parseInt(e.target.value) }))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                                </div>
                            </div>

                            <div><label className="block mb-1">קטגוריה</label><select name="category" value={productForm.category} onChange={handleProductInputChange} className="w-full bg-gray-700 rounded p-2 border border-gray-600">{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
                            
                            <div className="flex items-center pt-2">
                                <input 
                                    id="isUpsellProduct"
                                    type="checkbox" 
                                    name="isUpsellProduct"
                                    checked={productForm.isUpsellProduct} 
                                    onChange={handleProductInputChange}
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="isUpsellProduct" className="mr-2 text-sm font-medium text-gray-300">האם זהו מוצר נלווה (Upsell)?</label>
                            </div>

                            {/* Conditionally hide the color options if it's an upsell product */}
                            {!productForm.isUpsellProduct && (
                                <div>
                                    <label className="block mb-1">צבעי כרטיס זמינים</label>
                                    <div className="grid grid-cols-2 gap-2 bg-gray-700 p-2 rounded">
                                        {ALL_CARD_COLORS.map(color => (
                                            <label key={color} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={productForm.availableColors.has(color)} 
                                                    onChange={() => handleColorToggle(color)} 
                                                    className="form-checkbox bg-gray-600 border-gray-500"
                                                />
                                                <span>{color}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button type="submit" disabled={uploading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
                                {uploading ? 'מעלה קובץ...' : (isEditing ? 'עדכן מוצר' : 'הוסף מוצר')}
                            </button>
                            {isEditing && <button type="button" onClick={resetProductForm} className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">בטל עריכה</button>}
                        </div>
                    </form>
                </div>
            </div>
        )}

        {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">רשימת קטגוריות</h2>
                    <div className="bg-gray-800 rounded-lg">
                        <ul className="divide-y divide-gray-700">{categories.map(c => <li key={c._id} className="p-4 flex justify-between items-center"><span>{c.name}</span><div className="space-x-2 space-x-reverse"><button type="button" onClick={() => handleSelectCategoryToEdit(c)} className="font-medium text-blue-500 hover:underline">ערוך</button><button type="button" onClick={() => handleDeleteCategory(c._id)} className="font-medium text-red-500 hover:underline">מחק</button></div></li>)}</ul>
                    </div>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">{isEditing ? 'עריכת קטגוריה' : 'הוסף קטגוריה חדשה'}</h2>
                    <form onSubmit={handleCategoryFormSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
                        <div><label className="block mb-1">שם הקטגוריה</label><input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} required className="w-full bg-gray-700 rounded p-2 border border-gray-600"/></div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">{isEditing ? 'עדכן קטגוריה' : 'הוסף קטגוריה'}</button>
                        {isEditing && <button type="button" onClick={resetCategoryForm} className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">בטל עריכה</button>}
                    </form>
                </div>
            </div>
        )}

        
        {activeTab === 'gallery' && <GallerySettingsPage />}
        {activeTab === 'orders' && <AdminOrdersPage />}
        {activeTab === 'users' && <AdminUsersPage />}
        {activeTab === 'settings' && <SiteSettingsPage />}
      </div>
    );
}