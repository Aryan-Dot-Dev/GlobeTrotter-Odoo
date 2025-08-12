import { supabase } from "../config/supabase.js";

// Get overview statistics
const getOverviewStats = async (req, res) => {
    try {
        // User is already authenticated and verified as admin via middleware
        console.log('📊 Admin user accessing overview stats:', req.user.id);

        // Get total users count
        const { count: totalUsers, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Get total trips count
        const { count: totalTrips, error: tripsError } = await supabase
            .from('trips')
            .select('*', { count: 'exact', head: true });

        // Get total activities count
        const { count: totalActivities, error: activitiesError } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true });

        // Get total stops count
        const { count: totalStops, error: stopsError } = await supabase
            .from('stops')
            .select('*', { count: 'exact', head: true });

        // Get trips created in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: recentTrips, error: recentTripsError } = await supabase
            .from('trips')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thirtyDaysAgo.toISOString());

        // Get new users in last 30 days
        const { count: newUsers, error: newUsersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thirtyDaysAgo.toISOString());

        if (usersError || tripsError || activitiesError || stopsError || recentTripsError || newUsersError) {
            console.error('Error fetching overview stats:', { usersError, tripsError, activitiesError, stopsError, recentTripsError, newUsersError });
            return res.status(500).json({ message: 'Error fetching overview statistics' });
        }

        return res.status(200).json({
            message: 'Overview statistics fetched successfully',
            stats: {
                totalUsers: totalUsers || 0,
                totalTrips: totalTrips || 0,
                totalActivities: totalActivities || 0,
                totalStops: totalStops || 0,
                recentTrips: recentTrips || 0,
                newUsers: newUsers || 0
            }
        });

    } catch (error) {
        console.error('Error in getOverviewStats:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get popular destinations
const getPopularDestinations = async (req, res) => {
    try {
        // User is already authenticated and verified as admin via middleware
        console.log('📊 Admin user accessing popular destinations:', req.user.id);

        // Get popular start destinations
        const { data: startDestinations, error: startError } = await supabase
            .from('trips')
            .select('start_destination')
            .not('start_destination', 'is', null);

        // Get popular end destinations
        const { data: endDestinations, error: endError } = await supabase
            .from('trips')
            .select('end_destination')
            .not('end_destination', 'is', null);

        // Get popular stops
        const { data: stops, error: stopsError } = await supabase
            .from('stops')
            .select('destination')
            .not('destination', 'is', null);

        if (startError || endError || stopsError) {
            console.error('Error fetching destinations:', { startError, endError, stopsError });
            return res.status(500).json({ message: 'Error fetching destination data' });
        }

        // Count occurrences
        const destinationCounts = {};

        // Count start destinations
        startDestinations?.forEach(item => {
            const dest = item.start_destination?.trim();
            if (dest) {
                destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
            }
        });

        // Count end destinations
        endDestinations?.forEach(item => {
            const dest = item.end_destination?.trim();
            if (dest) {
                destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
            }
        });

        // Count stops
        stops?.forEach(item => {
            const dest = item.destination?.trim();
            if (dest) {
                destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
            }
        });

        // Convert to array and sort
        const popularDestinations = Object.entries(destinationCounts)
            .map(([destination, count]) => ({ destination, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10

        return res.status(200).json({
            message: 'Popular destinations fetched successfully',
            destinations: popularDestinations
        });

    } catch (error) {
        console.error('Error in getPopularDestinations:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get popular activities
const getPopularActivities = async (req, res) => {
    try {
        // User is already authenticated and verified as admin via middleware
        console.log('📊 Admin user accessing popular activities:', req.user.id);

        // Get all activities
        const { data: activities, error: activitiesError } = await supabase
            .from('activities')
            .select('activity')
            .not('activity', 'is', null);

        if (activitiesError) {
            console.error('Error fetching activities:', activitiesError);
            return res.status(500).json({ message: 'Error fetching activities data' });
        }

        // Count occurrences
        const activityCounts = {};
        activities?.forEach(item => {
            const activity = item.activity?.trim();
            if (activity) {
                activityCounts[activity] = (activityCounts[activity] || 0) + 1;
            }
        });

        // Convert to array and sort
        const popularActivities = Object.entries(activityCounts)
            .map(([activity, count]) => ({ activity, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10

        return res.status(200).json({
            message: 'Popular activities fetched successfully',
            activities: popularActivities
        });

    } catch (error) {
        console.error('Error in getPopularActivities:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get user engagement stats
const getUserEngagement = async (req, res) => {
    try {
        // User is already authenticated and verified as admin via middleware
        console.log('📊 Admin user accessing user engagement:', req.user.id);

        // Get trips created per month for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: monthlyTrips, error: monthlyTripsError } = await supabase
            .from('trips')
            .select('created_at')
            .gte('created_at', sixMonthsAgo.toISOString())
            .order('created_at', { ascending: true });

        // Get user registration data for last 6 months
        const { data: monthlyUsers, error: monthlyUsersError } = await supabase
            .from('users')
            .select('created_at')
            .gte('created_at', sixMonthsAgo.toISOString())
            .order('created_at', { ascending: true });

        if (monthlyTripsError || monthlyUsersError) {
            console.error('Error fetching engagement data:', { monthlyTripsError, monthlyUsersError });
            return res.status(500).json({ message: 'Error fetching engagement data' });
        }

        // Process monthly data
        const monthlyData = {};
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
            monthlyData[monthKey] = { trips: 0, users: 0, month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) };
        }

        // Count trips per month
        monthlyTrips?.forEach(trip => {
            const monthKey = trip.created_at.slice(0, 7);
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].trips++;
            }
        });

        // Count users per month
        monthlyUsers?.forEach(user => {
            const monthKey = user.created_at.slice(0, 7);
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].users++;
            }
        });

        const engagementData = Object.values(monthlyData);

        return res.status(200).json({
            message: 'User engagement data fetched successfully',
            engagement: engagementData
        });

    } catch (error) {
        console.error('Error in getUserEngagement:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Get user management data
const getUserManagement = async (req, res) => {
    try {
        // User is already authenticated and verified as admin via middleware
        console.log('📊 Admin user accessing user management:', req.user.id);

        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Get users with their trip counts
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select(`
                id,
                email,
                name,
                username,
                avatar_url,
                location,
                created_at
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (usersError) {
            console.error('Error fetching users:', usersError);
            return res.status(500).json({ message: 'Error fetching users data' });
        }

        // Get trip counts for each user
        const usersWithTripCounts = await Promise.all(
            users.map(async (user) => {
                const { count: tripCount, error: tripError } = await supabase
                    .from('trips')
                    .select('*', { count: 'exact', head: true })
                    .eq('admin_id', user.id);

                return {
                    ...user,
                    tripCount: tripCount || 0
                };
            })
        );

        // Get total count for pagination
        const { count: totalUsers, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('Error fetching user count:', countError);
            return res.status(500).json({ message: 'Error fetching user count' });
        }

        return res.status(200).json({
            message: 'Users fetched successfully',
            users: usersWithTripCounts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers: totalUsers,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error in getUserManagement:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export { 
    getOverviewStats, 
    getPopularDestinations, 
    getPopularActivities, 
    getUserEngagement, 
    getUserManagement 
};
