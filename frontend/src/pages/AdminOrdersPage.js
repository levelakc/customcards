import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import Modal from '../components/Modal'; // Import the new Modal component
import CreditCardPreview from '../components/CreditCardPreview';

const colorMap = { 'זהב': '#d4af37', 'כסף': '#c0c0c0', 'שחור': '#333333', 'לבן': '#ffffff', 'רוז גולד': '#b76e79', 'כחול אוקיינוס': '#4682b4', 'סגול': '#6a0dad', 'שחור פחמן': '#4a4a4a' };

export default function AdminOrdersPage() {
    const { t } = useTranslation();
    const { getSymbol, convert } = useCurrency();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editableOrder, setEditableOrder] = useState(null);

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
            alert(t('couldNotUpdateStatus'));
        }
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setEditableOrder(JSON.parse(JSON.stringify(order))); // Deep copy for editing
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
        setIsEditMode(false);
        setEditableOrder(null);
    };

    const openDeleteConfirmation = (order) => {
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteOrder = async () => {
        if (orderToDelete) {
            try {
                await api.deleteOrder(orderToDelete._id, token);
                fetchOrders();
                setIsDeleteModalOpen(false);
                setOrderToDelete(null);
            } catch (error) {
                console.error("Failed to delete order:", error);
                alert(`${t('couldNotDeleteOrder')} ${error.message}`);
            }
        }
    };

    const handleSelectOrder = (orderId) => {
        setSelectedOrders(prevSelected => {
            if (prevSelected.includes(orderId)) {
                return prevSelected.filter(id => id !== orderId);
            } else {
                return [...prevSelected, orderId];
            }
        });
    };

    const handleSelectAllOrders = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(orders.map(order => order._id));
        }
    };

    const openBulkDeleteConfirmation = () => {
        setIsBulkDeleteModalOpen(true);
    };

    const handleBulkDeleteOrders = async () => {
        try {
            await api.deleteOrders(selectedOrders, token);
            fetchOrders();
            setSelectedOrders([]);
            setIsBulkDeleteModalOpen(false);
                    } catch (error) {
                        console.error("Failed to delete orders:", error);
                        alert(t('couldNotDeleteOrders'));
                    }    };

    const handleInputChange = (e, field, index) => {
        const { name, value } = e.target;
        setEditableOrder(prev => {
            if (field === 'user') {
                return { ...prev, user: { ...prev.user, [name]: value } };
            }
            if (field === 'address') {
                return { ...prev, user: { ...prev.user, address: { ...prev.user.address, [name]: value } } };
            }
            if (field === 'item') {
                const newItems = [...prev.orderItems];
                newItems[index] = { ...newItems[index], [name]: value };
                return { ...prev, orderItems: newItems };
            }
            return prev;
        });
    };

    const handleRemoveItem = (index) => {
        setEditableOrder(prev => {
            const newItems = [...prev.orderItems];
            newItems.splice(index, 1);
            return { ...prev, orderItems: newItems };
        });
    };

    const handleSaveChanges = async () => {
        try {
            await api.updateOrder(editableOrder._id, editableOrder, token);
            fetchOrders();
            setIsEditMode(false);
            closeModal();
        } catch (error) {
            console.error("Failed to update order:", error);
            alert(t('couldNotUpdateOrder'));
        }
    };

    if (loading) {
        return <div className="text-center p-10 text-white">{t('loadingOrders')}...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('orderManagement')}</h2>
            {selectedOrders.length > 0 && (
                <button onClick={openBulkDeleteConfirmation} className="bg-red-500 text-white px-4 py-2 rounded mb-4">
                    {t('deleteSelected')} ({selectedOrders.length})
                </button>
            )}
            <div className="bg-gray-800 rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                <input type="checkbox" onChange={handleSelectAllOrders} checked={selectedOrders.length === orders.length && orders.length > 0} />
                            </th>
                            <th scope="col" className="px-6 py-3">{t('orderId')}</th>
                            <th scope="col" className="px-6 py-3">{t('customer')}</th>
                            <th scope="col" className="px-6 py-3">{t('date')}</th>
                            <th scope="col" className="px-6 py-3">{t('total')}</th>
                            <th scope="col" className="px-6 py-3">{t('status')}</th>
                            <th scope="col" className="px-6 py-3">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} className="border-b border-gray-700 hover:bg-gray-600">
                                <td className="px-6 py-4">
                                    <input type="checkbox" onChange={() => handleSelectOrder(order._id)} checked={selectedOrders.includes(order._id)} />
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{order._id}</td>
                                <td className="px-6 py-4 font-medium text-white">{order.user ? order.user.name : t('notApplicable')}</td>
                                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString('he-IL')}</td>
                                <td className="px-6 py-4">{getSymbol()}{convert(order.totalPrice).toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="bg-gray-700 rounded p-1 border border-gray-600"
                                    >
                                        <option value="Processing">{t('processing')}</option>
                                        <option value="Shipped">{t('shipped')}</option>
                                        <option value="Delivered">{t('delivered')}</option>
                                        <option value="Cancelled">{t('cancelled')}</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => openOrderDetails(order)} className="font-medium text-green-500 hover:underline mr-4">
                                        {t('viewDetails')}
                                    </button>
                                    <button onClick={() => openDeleteConfirmation(order)} className="font-medium text-red-500 hover:underline">
                                        {t('delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditMode ? `${t('editOrder')}: ${editableOrder?._id}` : `${t('orderDetails')}: ${selectedOrder?._id}`}>
                {editableOrder && (
                    <div className="space-y-6 text-gray-300">
                        <div className="p-4 bg-gray-900 rounded-lg">
                            <h3 className="font-bold text-lg text-white mb-2">{t('customerInformation')}</h3>
                            {isEditMode ? (
                                <div className="space-y-2">
                                    <input type="text" name="name" value={editableOrder.user?.name} onChange={(e) => handleInputChange(e, 'user')} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                    <input type="email" name="email" value={editableOrder.user?.email} onChange={(e) => handleInputChange(e, 'user')} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                    <input type="text" name="phone" value={editableOrder.user?.phone} onChange={(e) => handleInputChange(e, 'user')} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                    <input type="text" name="street" value={editableOrder.user?.address?.street} onChange={(e) => handleInputChange(e, 'address')} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                    <input type="text" name="city" value={editableOrder.user?.address?.city} onChange={(e) => handleInputChange(e, 'address')} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                    <input type="text" name="postalCode" value={editableOrder.user?.address?.postalCode} onChange={(e) => handleInputChange(e, 'address')} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                </div>
                            ) : (
                                <>
                                    <p><strong className="text-gray-400">{t('name')}:</strong> {selectedOrder.user?.name}</p>
                                    <p><strong className="text-gray-400">{t('email')}:</strong> {selectedOrder.user?.email}</p>
                                    <p><strong className="text-gray-400">{t('phone')}:</strong> {selectedOrder.user?.phone}</p>
                                    <div>
                                        <strong className="text-gray-400">{t('address')}:</strong>
                                        <p className="ml-2">{selectedOrder.user?.address?.street}</p>
                                        <p className="ml-2">{`${selectedOrder.user?.address?.city}, ${selectedOrder.user?.address?.postalCode}`}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-4 bg-gray-900 rounded-lg">
                            <h3 className="font-bold text-lg text-white mb-2">{t('orderSummary')}</h3>
                            <p><strong className="text-gray-400">{t('date')}:</strong> {new Date(selectedOrder.createdAt).toLocaleString('he-IL')}</p>
                            <p><strong className="text-gray-400">{t('total')}:</strong> {getSymbol()}{convert(editableOrder.orderItems.reduce((acc, item) => acc + item.qty * item.price, 0)).toFixed(2)}</p>
                            <p><strong className="text-gray-400">{t('status')}:</strong> {selectedOrder.status}</p>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2">{t('itemsOrdered')}</h3>
                            <ul className="space-y-4">
                                {editableOrder.orderItems.map((item, index) => (
                                    <li key={index} className="p-4 bg-gray-900 rounded-lg flex items-center space-x-4 space-x-reverse">
                                        <div className="w-24 h-auto flex-shrink-0">
                                            <CreditCardPreview
                                                backgroundColor={colorMap[item.color] || '#cccccc'}
                                                logoUrl={item.image}
                                                isDraggable={false}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            {isEditMode ? (
                                                <div className="space-y-2">
                                                    <input type="text" name="name" value={item.name} onChange={(e) => handleInputChange(e, 'item', index)} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                                    <input type="text" name="color" value={item.color} onChange={(e) => handleInputChange(e, 'item', index)} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                                    <input type="number" name="qty" value={item.qty} onChange={(e) => handleInputChange(e, 'item', index)} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                                    <input type="number" name="price" value={item.price} onChange={(e) => handleInputChange(e, 'item', index)} className="bg-gray-700 rounded p-1 border border-gray-600 w-full" />
                                                    <button onClick={() => handleRemoveItem(index)} className="text-red-500">{t('remove')}</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="font-bold text-white">{item.name}</p>
                                                    <p>{t('color')}: {item.color}</p>
                                                    <p>{t('quantity')}: {item.qty}</p>
                                                    <p>{t('price')}: {getSymbol()}{convert(item.price).toFixed(2)}</p>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-end">
                            {isEditMode ? (
                                <>
                                    <button onClick={() => setIsEditMode(false)} className="mr-4">{t('cancel')}</button>
                                    <button onClick={handleSaveChanges} className="bg-green-500 text-white px-4 py-2 rounded">{t('saveChanges')}</button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditMode(true)} className="bg-blue-500 text-white px-4 py-2 rounded">{t('editOrder')}</button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('confirmDeletion')}>
                {orderToDelete && (
                    <div>
                        <p>{t('deleteOrderConfirmation')} {orderToDelete._id}?</p>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="mr-4">{t('cancel')}</button>
                            <button onClick={handleDeleteOrder} className="bg-red-500 text-white px-4 py-2 rounded">{t('delete')}</button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title={t('confirmBulkDeletion')}>
                <div>
                    <p>{t('deleteOrdersConfirmation')} {selectedOrders.length} {t('orders')}?</p>
                    <div className="flex justify-end mt-4">
                        <button onClick={() => setIsBulkDeleteModalOpen(false)} className="mr-4">{t('cancel')}</button>
                        <button onClick={handleBulkDeleteOrders} className="bg-red-500 text-white px-4 py-2 rounded">{t('delete')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}