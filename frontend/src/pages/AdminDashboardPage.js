import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api/api';

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:8000'); // Make sure this matches your backend server address

export default function AdminDashboardPage() {
    const { token } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [todaysStats, setTodaysStats] = useState({ orders: 0, revenue: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);

    useEffect(() => {
        const fetchInitialStats = async () => {
            if (!token) return; // Don't fetch if not authenticated
            try {
                setLoadingStats(true);
                const data = await api.getAdminDashboardStats(token);
                setTodaysStats({
                    orders: data.totalOrdersToday,
                    revenue: data.totalRevenueToday,
                });
            } catch (err) {
                console.error("Failed to fetch initial dashboard stats:", err);
                setErrorStats(err.message);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchInitialStats();

        // Listen for online users count
        socket.on('onlineUsers', (count) => {
            setOnlineUsers(count);
        });

        // Listen for new orders
        socket.on('newOrder', (order) => {
            setRecentOrders(prevOrders => [order, ...prevOrders].slice(0, 5)); // Keep last 5 orders
            setTodaysStats(prevStats => ({
                orders: prevStats.orders + 1,
                revenue: prevStats.revenue + order.totalPrice,
            }));
        });

        // Clean up the socket connection when the component unmounts
        return () => {
            socket.off('onlineUsers');
            socket.off('newOrder');
        };
    }, [token]); // Re-run effect if token changes

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold">Online Users</h3>
                    <p className="text-3xl font-bold">{onlineUsers}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold">Today's Orders</h3>
                    {loadingStats ? (
                        <p className="text-xl">Loading...</p>
                    ) : errorStats ? (
                        <p className="text-red-400">Error: {errorStats}</p>
                    ) : (
                        <p className="text-3xl font-bold">{todaysStats.orders}</p>
                    )}
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold">Today's Revenue</h3>
                    {loadingStats ? (
                        <p className="text-xl">Loading...</p>
                    ) : errorStats ? (
                        <p className="text-red-400">Error: {errorStats}</p>
                    ) : (
                        <p className="text-3xl font-bold">₪{todaysStats.revenue.toFixed(2)}</p>
                    )}
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                {recentOrders.length > 0 ? (
                    <ul>
                        {recentOrders.map(order => (
                            <li key={order._id} className="border-b border-gray-700 py-2">
                                <p>Order ID: {order._id}</p>
                                <p>Total: ₪{order.totalPrice.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No recent orders.</p>
                )}
            </div>
        </div>
    );
}