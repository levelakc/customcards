import React, { createContext, useState, useContext } from 'react';
import * as api from '../api/api';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    const addToCart = (product, quantity = 1, selectedColor) => {
        setCartItems(prevItems => {
            const cartItemId = `${product._id || product.id}-${selectedColor}`;
            const existingItem = prevItems.find(item => item.cartItemId === cartItemId);

            if (existingItem) {
                return prevItems.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevItems, { ...product, quantity, selectedColor, cartItemId }];
            }
        });
        setShowPopup(true);
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
                )
            );
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const createOrder = async (token, messageToDesigner, guestInfo) => { // Add messageToDesigner and guestInfo parameter
        try {
            const orderItems = cartItems.map(item => ({
                name: item.name,
                qty: item.quantity,
                color: item.selectedColor,
                image: item.image,
                price: item.price,
                product: item._id ? item._id : null,
            }));

            const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const orderData = {
                orderItems,
                totalPrice,
                messageToDesigner, // Include messageToDesigner
                guestInfo, // Include guestInfo
            };

            await api.addOrder(orderData, token);
            
            clearCart();
            return { success: true };
        } catch (error) {
            console.error("Failed to create order:", error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        createOrder,
        showPopup,
        setShowPopup,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);