import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    AlertTriangle, 
    Plane, 
    Bed, 
    Activity, 
    UtensilsCrossed,
    MapPin,
    Calendar
} from "lucide-react";

const TripBudgetBreakdown = ({ trip, activities = [], stops = [] }) => {
    // Calculate budget data
    const budgetData = useMemo(() => {
        // Define category mappings and default costs
        const categoryMappings = {
            transport: ['flight', 'train', 'bus', 'taxi', 'uber', 'rental', 'car', 'transport', 'travel'],
            accommodation: ['hotel', 'hostel', 'airbnb', 'stay', 'accommodation', 'lodge', 'resort'],
            food: ['restaurant', 'meal', 'food', 'dining', 'breakfast', 'lunch', 'dinner', 'cafe', 'bar'],
            activities: ['tour', 'museum', 'park', 'adventure', 'activity', 'experience', 'ticket', 'entrance']
        };

        // Initialize categories
        let costs = {
            transport: 0,
            accommodation: 0,
            food: 0,
            activities: 0,
            other: 0
        };

        // Process activities and categorize costs
        activities.forEach(activity => {
            const cost = parseFloat(activity.estimated_cost) || 0;
            if (cost === 0) return;

            const activityName = (activity.activity || '').toLowerCase();
            const description = (activity.description || '').toLowerCase();
            const searchText = `${activityName} ${description}`;

            let categorized = false;

            // Check each category for matches
            for (const [category, keywords] of Object.entries(categoryMappings)) {
                if (keywords.some(keyword => searchText.includes(keyword))) {
                    costs[category] += cost;
                    categorized = true;
                    break;
                }
            }

            // If no category matched, add to other
            if (!categorized) {
                costs.other += cost;
            }
        });

        // Add estimated accommodation costs based on trip duration if no accommodation costs found
        if (costs.accommodation === 0 && trip?.start_date && trip?.end_date) {
            const startDate = new Date(trip.start_date);
            const endDate = new Date(trip.end_date);
            const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            costs.accommodation = nights * 6500; // Estimate ₹6,500 per night
        }

        // Add estimated transport costs if none found
        if (costs.transport === 0) {
            costs.transport = stops.length * 4000; // Estimate ₹4,000 per stop for transport
        }

        // Add estimated food costs if none found
        if (costs.food === 0 && trip?.start_date && trip?.end_date) {
            const startDate = new Date(trip.start_date);
            const endDate = new Date(trip.end_date);
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            costs.food = days * 3700; // Estimate ₹3,700 per day for food
        }

        return costs;
    }, [activities, stops, trip]);

    // Calculate totals and daily averages
    const totalCost = Object.values(budgetData).reduce((sum, cost) => sum + cost, 0);
    const tripDuration = useMemo(() => {
        if (!trip?.start_date || !trip?.end_date) return 1;
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }, [trip]);

    const dailyAverage = totalCost / tripDuration;
    const budgetAlert = dailyAverage > 12000; // Alert if daily cost exceeds ₹12,000

    // Prepare data for charts
    const pieChartData = [
        { name: 'Transport', value: budgetData.transport, fill: '#3b82f6', icon: Plane },
        { name: 'Accommodation', value: budgetData.accommodation, fill: '#10b981', icon: Bed },
        { name: 'Food & Dining', value: budgetData.food, fill: '#f59e0b', icon: UtensilsCrossed },
        { name: 'Activities', value: budgetData.activities, fill: '#8b5cf6', icon: Activity },
        { name: 'Other', value: budgetData.other, fill: '#6b7280', icon: MapPin }
    ].filter(item => item.value > 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const chartConfig = {
        transport: {
            label: "Transport",
            color: "#3b82f6",
        },
        accommodation: {
            label: "Accommodation", 
            color: "#10b981",
        },
        food: {
            label: "Food & Dining",
            color: "#f59e0b",
        },
        activities: {
            label: "Activities",
            color: "#8b5cf6",
        },
        other: {
            label: "Other",
            color: "#6b7280",
        },
    };

    return (
        <div className="space-y-6">
            {/* Budget Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Budget</p>
                                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalCost)}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Daily Average</p>
                                <p className="text-2xl font-bold text-green-900">{formatCurrency(dailyAverage)}</p>
                            </div>
                            <Calendar className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br ${budgetAlert ? 'from-red-50 to-red-100 border-red-200' : 'from-gray-50 to-gray-100 border-gray-200'}`}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${budgetAlert ? 'text-red-600' : 'text-gray-600'}`}>
                                    Budget Status
                                </p>
                                <p className={`text-lg font-bold ${budgetAlert ? 'text-red-900' : 'text-gray-900'}`}>
                                    {budgetAlert ? 'Over Budget' : 'On Track'}
                                </p>
                            </div>
                            {budgetAlert ? (
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            ) : (
                                <TrendingUp className="w-8 h-8 text-gray-500" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6">
                {/* Pie Chart - Cost Breakdown */}
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-gray-100">
                            <DollarSign className="w-5 h-5 text-blue-400" />
                            <span>Cost Breakdown by Category</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Category Breakdown */}
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-gray-100">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <span>Detailed Cost Analysis</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pieChartData.map((category) => {
                            const percentage = ((category.value / totalCost) * 100).toFixed(1);
                            const IconComponent = category.icon;
                            
                            return (
                                <div key={category.name} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div 
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: category.fill }}
                                        ></div>
                                        <IconComponent className="w-5 h-5 text-gray-400" />
                                        <span className="font-medium text-gray-200">{category.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-100">{formatCurrency(category.value)}</div>
                                        <div className="text-sm text-gray-400">{percentage}% of total</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Budget Tips */}
            {budgetAlert && (
                <Card className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
                            <div>
                                <h3 className="font-semibold text-red-800 mb-2">Budget Alert</h3>
                                <p className="text-red-700 text-sm mb-3">
                                    Your daily average of {formatCurrency(dailyAverage)} exceeds the recommended budget of ₹12,000/day.
                                </p>
                                <div className="text-sm text-red-600">
                                    <p>💡 <strong>Tips to reduce costs:</strong></p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Consider more budget-friendly accommodation options</li>
                                        <li>Look for free or low-cost activities and attractions</li>
                                        <li>Plan some meals at local markets or grocery stores</li>
                                        <li>Use public transportation instead of taxis</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TripBudgetBreakdown;
