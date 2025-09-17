import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api/api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:8000');

export default function AdminDashboardPage() {
    const { token } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [summaryStats, setSummaryStats] = useState(null);
    const [salesTrendData, setSalesTrendData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const [summary, salesTrend] = await Promise.all([
                    api.getAdminDashboardSummary(token),
                    api.getAdminSalesTrend(token),
                ]);
                setSummaryStats(summary);
                setSalesTrendData(salesTrend);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        socket.on('onlineUsers', (count) => {
            setOnlineUsers(count);
        });

        socket.on('newOrder', (order) => {
            setRecentOrders(prevOrders => [order, ...prevOrders].slice(0, 5));
            // Optimistically update summary stats for today
            setSummaryStats(prevSummary => {
                if (!prevSummary) return null;
                return {
                    ...prevSummary,
                    totalOrdersToday: prevSummary.totalOrdersToday + 1,
                    totalRevenueToday: prevSummary.totalRevenueToday + order.totalPrice,
                    totalOrdersLast7Days: prevSummary.totalOrdersLast7Days + 1,
                    totalRevenueLast7Days: prevSummary.totalRevenueLast7Days + order.totalPrice,
                    totalOrdersLast30Days: prevSummary.totalOrdersLast30Days + 1,
                    totalRevenueLast30Days: prevSummary.totalRevenueLast30Days + order.totalPrice,
                    totalOrdersAllTime: prevSummary.totalOrdersAllTime + 1,
                    totalRevenueAllTime: prevSummary.totalRevenueAllTime + order.totalPrice,
                    // AOV would need re-calculation based on new total orders/revenue
                    averageOrderValue: (prevSummary.totalRevenueAllTime + order.totalPrice) / (prevSummary.totalOrdersAllTime + 1),
                };
            });
            // Optimistically update sales trend for today
            setSalesTrendData(prevTrend => {
                if (!prevTrend || prevTrend.length === 0) return null;
                const today = new Date();
                const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
                const updatedTrend = prevTrend.map(day => {
                    if (day.date === todayString) {
                        return { ...day, totalRevenue: day.totalRevenue + order.totalPrice, countOrders: day.countOrders + 1 };
                    }
                    return day;
                });
                return updatedTrend;
            });
        });

        return () => {
            socket.off('onlineUsers');
            socket.off('newOrder');
        };
    }, [token]);

    const chartData = {
        labels: salesTrendData ? salesTrendData.map(data => data.date) : [],
        datasets: [
            {
                label: 'Revenue',
                data: salesTrendData ? salesTrendData.map(data => data.totalRevenue) : [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#fff', // White legend text
                },
            },
            title: {
                display: true,
                text: 'Revenue Trend (Last 30 Days)',
                color: '#fff', // White title text
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ILS' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#ccc', // White x-axis labels
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)', // Light grid lines
                },
            },
            y: {
                ticks: {
                    color: '#ccc', // White y-axis labels
                    callback: function(value) {
                        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ILS' }).format(value);
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)', // Light grid lines
                },
            },
        },
    };

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">Loading Dashboard...</div>;
    if (error) return <div className="text-center p-10 text-red-400 bg-gray-900 min-h-screen">Error: {error}</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-900 text-white min-h-screen">
            <h2 className="text-3xl font-extrabold mb-6">Dashboard Overview</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard title="Online Users" value={onlineUsers} />
                <DashboardCard title="Today's Revenue" value={`₪${summaryStats.totalRevenueToday.toFixed(2)}`} />
                <DashboardCard title="Today's Orders" value={summaryStats.totalOrdersToday} />
                <DashboardCard title="Avg. Order Value" value={`₪${summaryStats.averageOrderValue.toFixed(2)}`} />
                <DashboardCard title="Last 7 Days Revenue" value={`₪${summaryStats.totalRevenueLast7Days.toFixed(2)}`} />
                <DashboardCard title="Last 7 Days Orders" value={summaryStats.totalOrdersLast7Days} />
                <DashboardCard title="Last 30 Days Revenue" value={`₪${summaryStats.totalRevenueLast30Days.toFixed(2)}`} />
                <DashboardCard title="Last 30 Days Orders" value={summaryStats.totalOrdersLast30Days} />
                <DashboardCard title="Total Customers" value={summaryStats.totalCustomers} />
                <DashboardCard title="New Customers Today" value={summaryStats.newCustomersToday} />
                <DashboardCard title="All Time Revenue" value={`₪${summaryStats.totalRevenueAllTime.toFixed(2)}`} />
                <DashboardCard title="All Time Orders" value={summaryStats.totalOrdersAllTime} />
            </div>

            {/* Sales Trend Chart */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h3 className="text-xl font-semibold mb-4">Revenue Trend (Last 30 Days)</h3>
                {salesTrendData && salesTrendData.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <p className="text-gray-400">No sales data available for the last 30 days.</p>
                )}
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Recent Orders (Live)</h3>
                {recentOrders.length > 0 ? (
                    <ul className="divide-y divide-gray-700">
                        {recentOrders.map(order => (
                            <li key={order._id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Order ID: {order._id}</p>
                                    <p className="text-sm text-gray-400">User: {order.user?.name || 'Guest'}</p>
                                </div>
                                <p className="font-bold">₪{order.totalPrice.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No recent orders.</p>
                )}
            </div>
        </div>
    );
}

// Simple reusable card component for dashboard stats
const DashboardCard = ({ title, value }) => (
    <div className="bg-gray-800 p-5 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
        <p className="text-4xl font-bold text-indigo-400">{value}</p>
    </div>
);
