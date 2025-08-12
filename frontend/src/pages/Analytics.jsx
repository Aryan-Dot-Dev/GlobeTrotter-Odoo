import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
    Users, 
    MapPin, 
    Calendar, 
    Activity, 
    TrendingUp, 
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    ArrowLeft,
    Loader2,
    RefreshCw
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie } from "recharts";
import {
    getOverviewStats,
    getPopularDestinations,
    getPopularActivities,
    getUserEngagement,
    getUserManagement
} from '@/api/analytics.api';

const Analytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [overviewStats, setOverviewStats] = useState({});
    const [popularDestinations, setPopularDestinations] = useState([]);
    const [popularActivities, setPopularActivities] = useState([]);
    const [engagementData, setEngagementData] = useState([]);
    const [userData, setUserData] = useState({ users: [], pagination: {} });
    const [userPage, setUserPage] = useState(1);

    // Colors for charts
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

    const fetchAllData = React.useCallback(async () => {
        try {
            const [overview, destinations, activities, engagement, users] = await Promise.all([
                getOverviewStats(),
                getPopularDestinations(),
                getPopularActivities(),
                getUserEngagement(),
                getUserManagement(userPage, 10)
            ]);

            setOverviewStats(overview.stats);
            setPopularDestinations(destinations.destinations);
            setPopularActivities(activities.activities);
            setEngagementData(engagement.engagement);
            setUserData(users);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userPage]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAllData();
    };

    const StatCard = ({ title, value, icon: Icon, change, changeType }) => {
        return (
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">{title}</p>
                            <p className="text-3xl font-bold text-white">{value?.toLocaleString() || 0}</p>
                            {change !== undefined && (
                                <div className="flex items-center mt-2">
                                    {changeType === 'increase' ? (
                                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                    )}
                                    <span className={`text-sm ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                                        {Math.abs(change)}% from last month
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-700 p-3 rounded-lg">
                            <Icon className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-400">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-400 hover:text-white hover:bg-gray-700 mr-4"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                                <p className="text-gray-400">Monitor app performance and user behavior</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {refreshing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={overviewStats.totalUsers}
                        icon={Users}
                        change={15}
                        changeType="increase"
                    />
                    <StatCard
                        title="Total Trips"
                        value={overviewStats.totalTrips}
                        icon={MapPin}
                        change={8}
                        changeType="increase"
                    />
                    <StatCard
                        title="Total Activities"
                        value={overviewStats.totalActivities}
                        icon={Activity}
                        change={12}
                        changeType="increase"
                    />
                    <StatCard
                        title="New Users (30d)"
                        value={overviewStats.newUsers}
                        icon={TrendingUp}
                        change={25}
                        changeType="increase"
                    />
                </div>

                {/* Tabs for different analytics views */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-gray-800 border border-gray-700">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="destinations" className="data-[state=active]:bg-gray-700">
                            <MapPin className="h-4 w-4 mr-2" />
                            Popular Places
                        </TabsTrigger>
                        <TabsTrigger value="activities" className="data-[state=active]:bg-gray-700">
                            <Activity className="h-4 w-4 mr-2" />
                            Activities
                        </TabsTrigger>
                        <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">
                            <Users className="h-4 w-4 mr-2" />
                            User Management
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* User & Trip Growth Chart */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Growth Trends (6 Months)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            trips: {
                                                label: "Trips Created",
                                                color: "#3B82F6",
                                            },
                                            users: {
                                                label: "New Users",
                                                color: "#10B981",
                                            },
                                        }}
                                        className="h-[300px]"
                                    >
                                        <LineChart data={engagementData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <ChartLegend content={<ChartLegendContent />} />
                                            <Line 
                                                dataKey="trips" 
                                                type="monotone" 
                                                stroke="var(--color-trips)"
                                                strokeWidth={2}
                                            />
                                            <Line 
                                                dataKey="users" 
                                                type="monotone" 
                                                stroke="var(--color-users)"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Total Stops Created</span>
                                        <Badge variant="secondary" className="bg-gray-700 text-white">
                                            {overviewStats.totalStops}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Recent Trips (30d)</span>
                                        <Badge variant="secondary" className="bg-blue-600 text-white">
                                            {overviewStats.recentTrips}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Avg Activities per Trip</span>
                                        <Badge variant="secondary" className="bg-green-600 text-white">
                                            {overviewStats.totalTrips > 0 ? 
                                                Math.round(overviewStats.totalActivities / overviewStats.totalTrips) : 0
                                            }
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">User Engagement Rate</span>
                                        <Badge variant="secondary" className="bg-purple-600 text-white">
                                            {overviewStats.totalUsers > 0 ? 
                                                Math.round((overviewStats.recentTrips / overviewStats.totalUsers) * 100) : 0
                                            }%
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Popular Destinations Tab */}
                    <TabsContent value="destinations" className="space-y-6">
                        <div className="flex flex-col space-y-6">
                            {/* Bar Chart */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Top 15 Destinations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            count: {
                                                label: "Mentions",
                                                color: "#3B82F6",
                                            },
                                        }}
                                        className="h-[500px] w-full"
                                    >
                                        <BarChart 
                                            data={popularDestinations.slice(0, 15)} 
                                            margin={{ top: 20, right: 40, left: 20, bottom: 80 }}
                                            barGap={10}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="destination" 
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                tick={{ fontSize: 12 }}
                                                interval={0}
                                                tickMargin={10}
                                            />
                                            <YAxis 
                                                tick={{ fontSize: 12 }}
                                                label={{ value: 'Number of Mentions', angle: -90, position: 'insideLeft' }}
                                            />
                                            <ChartTooltip 
                                                content={<ChartTooltipContent />}
                                                labelFormatter={(label) => `Destination: ${label}`}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                                                    border: '1px solid rgba(55, 65, 81, 0.8)',
                                                    borderRadius: '8px',
                                                    backdropFilter: 'blur(8px)'
                                                }}
                                                cursor={false}
                                            />
                                            <Bar 
                                                dataKey="count" 
                                                fill="var(--color-count)"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={60}
                                            />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* List View */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Destination Rankings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {popularDestinations.map((dest, index) => (
                                            <div key={dest.destination} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-white font-medium">{dest.destination}</span>
                                                </div>
                                                <Badge variant="secondary" className="bg-gray-600 text-white">
                                                    {dest.count} mentions
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Popular Activities Tab */}
                    <TabsContent value="activities" className="space-y-6">
                        <div className="flex flex-col space-y-6">
                            {/* Pie Chart */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Activity Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            ...popularActivities.slice(0, 8).reduce((config, activity, index) => {
                                                config[activity.activity] = {
                                                    label: activity.activity,
                                                    color: COLORS[index % COLORS.length],
                                                };
                                                return config;
                                            }, {})
                                        }}
                                        className="h-[400px]"
                                    >
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Pie
                                                data={popularActivities.slice(0, 8).map((activity, index) => ({
                                                    ...activity,
                                                    fill: COLORS[index % COLORS.length]
                                                }))}
                                                dataKey="count"
                                                nameKey="activity"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                label={({ activity, percent }) => 
                                                    `${activity}: ${(percent * 100).toFixed(0)}%`
                                                }
                                                labelLine={false}
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Activities List */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Most Popular Activities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {popularActivities.map((activity, index) => (
                                            <div key={activity.activity} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                                <div className="flex items-center">
                                                    <div 
                                                        className="rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 text-white"
                                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-white font-medium">{activity.activity}</span>
                                                </div>
                                                <Badge variant="secondary" className="bg-gray-600 text-white">
                                                    {activity.count} times
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* User Management Tab */}
                    <TabsContent value="users" className="space-y-6">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-white">User Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="pb-3 text-gray-400 font-medium">User</th>
                                                <th className="pb-3 text-gray-400 font-medium">Email</th>
                                                <th className="pb-3 text-gray-400 font-medium">Location</th>
                                                <th className="pb-3 text-gray-400 font-medium">Trips Created</th>
                                                <th className="pb-3 text-gray-400 font-medium">Join Date</th>
                                                <th className="pb-3 text-gray-400 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userData.users?.map((user) => (
                                                <tr key={user.id} className="border-b border-gray-700">
                                                    <td className="py-4">
                                                        <div>
                                                            <div className="font-medium text-white">
                                                                {user.name || user.username || user.email?.split('@')[0] || 'Unknown User'}
                                                            </div>
                                                            <div className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-gray-300">{user.email}</td>
                                                    <td className="py-4 text-gray-300">{user.location || 'Not specified'}</td>
                                                    <td className="py-4">
                                                        <Badge 
                                                            variant="secondary" 
                                                            className={`${
                                                                user.tripCount > 5 ? 'bg-green-600' : 
                                                                user.tripCount > 2 ? 'bg-blue-600' : 'bg-gray-600'
                                                            } text-white`}
                                                        >
                                                            {user.tripCount}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 text-gray-300">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4">
                                                        <Badge variant="secondary" className="bg-green-600 text-white">
                                                            Active
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {userData.pagination?.totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-gray-400">
                                            Showing {((userData.pagination.currentPage - 1) * userData.pagination.limit) + 1} to{' '}
                                            {Math.min(userData.pagination.currentPage * userData.pagination.limit, userData.pagination.totalUsers)} of{' '}
                                            {userData.pagination.totalUsers} users
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
                                                disabled={userPage === 1}
                                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setUserPage(prev => prev + 1)}
                                                disabled={userPage >= userData.pagination.totalPages}
                                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Analytics;
