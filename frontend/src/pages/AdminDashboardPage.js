import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import * as api from '../api/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:8000');

export default function AdminDashboardPage() {
    const { t } = useTranslation();
    const { getSymbol, convert } = useCurrency();
    const { token } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [summaryStats, setSummaryStats] = useState(null);
    const [salesTrendData, setSalesTrendData] = useState(null);
    const [topProducts, setTopProducts] = useState(null);
    const [salesByCategory, setSalesByCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const [summary, salesTrend, products, categories] = await Promise.all([
                    api.getAdminDashboardSummary(token),
                    api.getAdminSalesTrend(token),
                    api.getAdminTopSellingProducts(token),
                    api.getAdminSalesByCategory(token),
                ]);
                setSummaryStats(summary);
                setSalesTrendData(salesTrend);
                setTopProducts(products);
                setSalesByCategory(categories);
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

    const lineChartData = {
        labels: salesTrendData ? salesTrendData.map(data => data.date) : [],
        datasets: [
            {
                label: t('revenue'),
                data: salesTrendData ? salesTrendData.map(data => convert(data.totalRevenue)) : [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#fff',
                },
            },
            title: {
                display: true,
                text: t('revenueTrend'),
                color: '#fff',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += getSymbol() + context.parsed.y.toFixed(2);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#ccc',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                ticks: {
                    color: '#ccc',
                    callback: function(value) {
                        return getSymbol() + value.toFixed(2);
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
    };

    const topProductsChartData = {
        labels: topProducts ? topProducts.map(p => p.name) : [],
        datasets: [
            {
                label: t('revenue'),
                data: topProducts ? topProducts.map(p => convert(p.totalRevenue)) : [],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const topProductsChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#fff',
                },
            },
            title: {
                display: true,
                text: t('top5Products'),
                color: '#fff',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += getSymbol() + context.parsed.y.toFixed(2);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#ccc',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                ticks: {
                    color: '#ccc',
                    callback: function(value) {
                        return getSymbol() + value.toFixed(2);
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
    };

    const salesByCategoryChartData = {
        labels: salesByCategory ? salesByCategory.map(c => c.category) : [],
        datasets: [
            {
                data: salesByCategory ? salesByCategory.map(c => convert(c.totalRevenue)) : [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const salesByCategoryChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#fff',
                },
            },
            title: {
                display: true,
                text: t('salesByCategory'),
                color: '#fff',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += getSymbol() + context.parsed.toFixed(2);
                        }
                        return label;
                    }
                }
            }
        },
    };

    if (loading) return <div className="text-center p-10 text-white bg-gray-900 min-h-screen">{t('loadingDashboard')}...</div>;
    if (error) return <div className="text-center p-10 text-red-400 bg-gray-900 min-h-screen">{t('error')}: {error}</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-900 text-white min-h-screen">
            <h2 className="text-3xl font-extrabold mb-6">{t('dashboardOverview')}</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard title={t('onlineUsers')} value={onlineUsers} />
                <DashboardCard title={t('todaysRevenue')} value={`${getSymbol()}${convert(summaryStats.totalRevenueToday).toFixed(2)}`} />
                <DashboardCard title={t('todaysOrders')} value={summaryStats.totalOrdersToday} />
                <DashboardCard title={t('avgOrderValue')} value={`${getSymbol()}${convert(summaryStats.averageOrderValue).toFixed(2)}`} />
                <DashboardCard title={t('last7DaysRevenue')} value={`${getSymbol()}${convert(summaryStats.totalRevenueLast7Days).toFixed(2)}`} />
                <DashboardCard title={t('last7DaysOrders')} value={summaryStats.totalOrdersLast7Days} />
                <DashboardCard title={t('last30DaysRevenue')} value={`${getSymbol()}${convert(summaryStats.totalRevenueLast30Days).toFixed(2)}`} />
                <DashboardCard title={t('last30DaysOrders')} value={summaryStats.totalOrdersLast30Days} />
                <DashboardCard title={t('totalCustomers')} value={summaryStats.totalCustomers} />
                <DashboardCard title={t('newCustomersToday')} value={summaryStats.newCustomersToday} />
                <DashboardCard title={t('allTimeRevenue')} value={`${getSymbol()}${convert(summaryStats.totalRevenueAllTime).toFixed(2)}`} />
                <DashboardCard title={t('allTimeOrders')} value={summaryStats.totalOrdersAllTime} />
            </div>

            {/* Sales Trend Chart */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h3 className="text-xl font-semibold mb-4">{t('revenueTrend')}</h3>
                {salesTrendData && salesTrendData.length > 0 ? (
                    <Line data={lineChartData} options={lineChartOptions} />
                ) : (
                    <p className="text-gray-400">{t('noSalesData')}</p>
                )}
            </div>

            {/* Product Performance & Sales by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">{t('top5Products')}</h3>
                    {topProducts && topProducts.length > 0 ? (
                        <Bar data={topProductsChartData} options={topProductsChartOptions} />
                    ) : (
                        <p className="text-gray-400">{t('noTopProducts')}</p>
                    )}
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">{t('salesByCategory')}</h3>
                    {salesByCategory && salesByCategory.length > 0 ? (
                        <Pie data={salesByCategoryChartData} options={salesByCategoryChartOptions} />
                    ) : (
                        <p className="text-gray-400">{t('noSalesByCategory')}</p>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">{t('recentOrders')}</h3>
                {recentOrders.length > 0 ? (
                    <ul className="divide-y divide-gray-700">
                        {recentOrders.map(order => (
                            <li key={order._id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{t('orderId')} {order._id}</p>
                                    <p className="text-sm text-gray-400">{t('user')} {order.user?.name || 'Guest'}</p>
                                </div>
                                <p className="font-bold">{getSymbol()}{convert(order.totalPrice).toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">{t('noRecentOrders')}</p>
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