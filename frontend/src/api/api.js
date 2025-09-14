// --- TEMPORARY DEBUGGING FIX ---
// This forces the production URL. If this works, the problem is the
// environment variable configuration on Render.
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const getAuthHeaders = (token) => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

// --- AUTHENTICATION ---
export const loginUser = async (email, password) => {
    const response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not log in');
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
};

export const registerUser = async (registrationData) => {
    const response = await fetch(`${BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not register');
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
};

// --- DATA FETCHING (Public) ---
export const getProducts = async () => {
    const response = await fetch(`${BASE_URL}/api/products`);
    if (!response.ok) throw new Error('Could not fetch products');
    return await response.json();
};

export const getProductById = async (id) => {
    const response = await fetch(`${BASE_URL}/api/products/${id}`);
    if (!response.ok) throw new Error('Could not fetch product');
    return await response.json();
};

export const getCategories = async () => {
    const response = await fetch(`${BASE_URL}/api/categories`);
    if (!response.ok) throw new Error('Could not fetch categories');
    return await response.json();
};

// --- ADMIN: Products ---
export const addProduct = async (productData, token) => {
    const response = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Could not create product');
    return await response.json();
};

export const updateProduct = async (id, productData, token) => {
    const response = await fetch(`${BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Could not update product');
    return await response.json();
};

export const deleteProduct = async (id, token) => {
    const response = await fetch(`${BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Could not delete product');
    return await response.json();
};

// --- ADMIN: Categories ---
export const addCategory = async (categoryData, token) => {
    const response = await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Could not create category');
    return await response.json();
};

export const updateCategory = async (id, categoryData, token) => {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Could not update category');
    return await response.json();
};

export const deleteCategory = async (id, token) => {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Could not delete category');
    return await response.json();
};

// --- ADMIN: Orders ---
export const getOrders = async (token) => {
    const response = await fetch(`${BASE_URL}/api/orders`, {
        headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Could not fetch orders');
    return await response.json();
};

export const updateOrderStatus = async (id, status, token) => {
    const response = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Could not update order status');
    return await response.json();
};

// --- ADMIN: File Upload ---
export const uploadFile = async (formData, token) => {
    const response = await fetch(`${BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'File upload failed');
    return data;
};

export const uploadVideoFile = async (formData, token) => {
    const response = await fetch(`${BASE_URL}/api/upload/video`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Video upload failed');
    return data;
};

// --- USER: Orders ---
export const addOrder = async (orderData, token) => {
    const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Could not create order');
    return await response.json();
};

// --- USER: Profile ---
export const getUserProfile = async (token) => {
    const response = await fetch(`${BASE_URL}/api/users/profile`, {
        headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Could not fetch user profile');
    return await response.json();
};

export const updateUserProfile = async (userData, token) => {
    const response = await fetch(`${BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not update profile');
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
};

// --- ADMIN: Users ---
export const getUsers = async (token) => {
    const response = await fetch(`${BASE_URL}/api/users`, {
        headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Could not fetch users');
    return await response.json();
};

export const updateUser = async (id, userData, token) => {
    const response = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Could not update user');
    return await response.json();
};

export const deleteUser = async (id, token) => {
    const response = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Could not delete user');
    return await response.json();
};

// --- REVIEWS ---
export const getReviews = async () => {
    const response = await fetch(`${BASE_URL}/api/reviews`);
    if (!response.ok) throw new Error('Could not fetch reviews');
    return await response.json();
};

export const createReview = async (reviewData, token) => {
    const response = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(reviewData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not add review');
    return data;
};

// --- SITE SETTINGS ---
export const getSiteSettings = async () => {
    const response = await fetch(`${BASE_URL}/api/settings`);
    if (!response.ok) throw new Error('Could not fetch site settings');
    return await response.json();
};

export const updateSiteSettings = async (settingsData, token) => {
    const response = await fetch(`${BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(settingsData),
    });
    if (!response.ok) throw new Error('Could not update site settings');
    return await response.json();
};

// --- NEW PAYMENT FUNCTIONS ---
export const getStripeApiKey = async () => {
    const response = await fetch(`${BASE_URL}/api/config/stripe-key`);
    if (!response.ok) throw new Error('Could not get Stripe key');
    return await response.json();
};

export const createPaymentIntent = async (paymentData, token) => {
    const response = await fetch(`${BASE_URL}/api/config/create-payment-intent`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not create payment intent');
    return data;
};

// --- NEW GALLERY IMAGES API FUNCTIONS ---
export const getGalleryImages = async () => {
    const response = await fetch(`${BASE_URL}/api/gallery`);
    // It's okay if it's a 404, it might just not be created yet.
    if (!response.ok && response.status !== 404) {
        throw new Error('Could not fetch gallery images');
    }
    if (response.status === 404) {
        return { images: [] }; // Return a default structure
    }
    return await response.json();
};

export const updateGalleryImages = async (imageData, token) => {
    const response = await fetch(`${BASE_URL}/api/gallery`, {
        method: 'POST', // Using POST for both create and update is common
        headers: getAuthHeaders(token),
        body: JSON.stringify(imageData),
    });
    if (!response.ok) throw new Error('Could not update gallery images');
    return await response.json();
};