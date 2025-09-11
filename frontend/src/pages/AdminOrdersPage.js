import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal'; // Import the new Modal component
import CreditCardPreview from '../components/CreditCardPreview';

const colorMap = { 'זהב': '#d4af37', 'כסף': '#c0c0c0', 'שחור': '#333333', 'לבן': '#ffffff', 'רוז גולד': '#b76e79', 'כחול אוקיינוס': '#4682b4', 'סגול': '#6a0dad', 'שחור פחמן': '#4a4a4a' };

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    // State for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const orderData = await api.getOrders(token);
            setOrders(orderData);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token, fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.updateOrderStatus(orderId, newStatus, token);
            fetchOrders();
        } catch (error) {
            console.error("Failed to update order status:", error);
            alert("Could not update status.");
        }
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    if (loading) {
        return <div className="text-center p-10 text-white">טוען הזמנות...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">ניהול הזמנות</h2>
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} className="border-b border-gray-700 hover:bg-gray-600">
                                <td className="px-6 py-4 font-mono text-xs">{order._id}</td>
                                <td className="px-6 py-4 font-medium text-white">{order.user ? order.user.name : 'N/A'}</td>
                                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('he-IL')}</td>
                                <td className="px-6 py-4">₪{order.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="bg-gray-700 rounded p-1 border border-gray-600"
                                    >
                                        <option value="Processing">בעיבוד</option>
                                        <option value="Shipped">נשלח</option>
                                        <option value="Delivered">הושלם</option>
                                        <option value="Cancelled">בוטל</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => openOrderDetails(order)} className="font-medium text-green-500 hover:underline">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={`Order Details: ${selectedOrder?._id}`}>
                {selectedOrder && (
                    <div className="space-y-6 text-gray-300">
                        {/* Customer Information Section */}
                        <div className="p-4 bg-gray-900 rounded-lg">
                            <h3 className="font-bold text-lg text-white mb-2">Customer Information</h3>
                            <p><strong className="text-gray-400">Name:</strong> {selectedOrder.user?.name}</p>
                            <p><strong className="text-gray-400">Email:</strong> {selectedOrder.user?.email}</p>
                            <p><strong className="text-gray-400">Phone:</strong> {selectedOrder.user?.phone}</p>
                            <div>
                                <strong className="text-gray-400">Address:</strong>
                                <p className="ml-2">{selectedOrder.user?.address?.street}</p>
                                <p className="ml-2">{`${selectedOrder.user?.address?.city}, ${selectedOrder.user?.address?.postalCode}`}</p>
                            </div>
                        </div>

                        {/* Order Summary Section */}
                        <div className="p-4 bg-gray-900 rounded-lg">
                            <h3 className="font-bold text-lg text-white mb-2">Order Summary</h3>
                            <p><strong className="text-gray-400">Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('he-IL')}</p>
                            <p><strong className="text-gray-400">Total:</strong> ₪{selectedOrder.totalPrice.toFixed(2)}</p>
                            <p><strong className="text-gray-400">Status:</strong> {selectedOrder.status}</p>
                        </div>
                        
                        {/* Items Section */}
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2">Items Ordered</h3>
                            <ul className="space-y-4">
                                {selectedOrder.orderItems.map((item, index) => (
                                    <li key={index} className="p-4 bg-gray-900 rounded-lg flex items-center space-x-4 space-x-reverse">
                                        <div className="w-24 h-auto flex-shrink-0">
                                            <CreditCardPreview
                                                backgroundColor={colorMap[item.color] || '#cccccc'}
                                                logoUrl={item.image}
                                                isDraggable={false}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-white">{item.name}</p>
                                            <p>Color: {item.color}</p>
                                            <p>Quantity: {item.qty}</p>
                                            <p>Price: ₪{item.price.toFixed(2)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}