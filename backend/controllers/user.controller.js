import { supabase } from "../config/supabase.js";

// Get all trips for the current user
const getUserTrips = async (req, res) => {
    try {
        // User is already authenticated via middleware, accessible via req.user
        const user = req.user;
        
        console.log('🔍 Fetching trips for user:', user.id);

        const { page = 1, limit = 50, sort = 'start_date' } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('trips')
            .select(`
                id,
                title,
                description,
                start_date,
                end_date,
                start_destination,
                end_destination,
                status,
                created_at,
                updated_at,
                stops (
                    id,
                    destination,
                    start_date,
                    end_date,
                    notes
                ),
                activities (
                    id,
                    activity,
                    description,
                    estimated_cost,
                    currency,
                    scheduled_at,
                    duration_minutes,
                    status
                )
            `)
            .eq('admin_id', user.id)
            .is('deleted_at', null)
            .range(offset, offset + limit - 1);

        // Add sorting
        if (sort === 'start_date') {
            query = query.order('start_date', { ascending: false });
        } else if (sort === 'created_at') {
            query = query.order('created_at', { ascending: false });
        } else if (sort === 'title') {
            query = query.order('title', { ascending: true });
        } else {
            query = query.order('start_date', { ascending: false });
        }

        const { data: trips, error } = await query;

        if (error) {
            console.error('❌ Database error:', error);
            return res.status(500).json({
                message: "Failed to fetch user trips",
                error: error.message
            });
        }

        console.log('✅ Found trips:', trips?.length || 0);

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from('trips')
            .select('*', { count: 'exact', head: true })
            .eq('admin_id', user.id)
            .is('deleted_at', null);

        if (countError) {
            console.error('Count error:', countError);
        }

        return res.status(200).json({
            message: "User trips fetched successfully",
            trips: trips || [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching user trips:', error);
        return res.status(500).json({
            message: "Failed to fetch user trips",
            error: error.message
        });
    }
};

// Get user profile information
const getUserProfile = async (req, res) => {
    try {
        // User is already authenticated via middleware
        const user = req.user;

        console.log('🔍 Fetching profile for user:', user.id);

        // Get user details from users table
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Profile error:', profileError);
            // If user doesn't exist in users table, create a basic profile from auth user
            const basicProfile = {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                avatar_url: user.user_metadata?.avatar_url || null,
                location: null,
                created_at: user.created_at,
                username: user.user_metadata?.username || null
            };
            
            return res.status(200).json({
                message: "User profile fetched successfully",
                profile: basicProfile
            });
        }

        return res.status(200).json({
            message: "User profile fetched successfully",
            profile: userProfile
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({
            message: "Failed to fetch user profile",
            error: error.message
        });
    }
};

// Update user profile information
const updateUserProfile = async (req, res) => {
    try {
        // User is already authenticated via middleware
        const user = req.user;
        const { name, username, location, avatar_url } = req.body;

        console.log('🔄 Updating profile for user:', user.id);

        // Validate required fields
        if (!name || !username) {
            return res.status(400).json({
                message: "Name and username are required"
            });
        }

        // Check if username is already taken by another user
        if (username) {
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id, username')
                .eq('username', username)
                .neq('id', user.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error('Error checking username:', checkError);
                return res.status(500).json({
                    message: "Error validating username",
                    error: checkError.message
                });
            }

            if (existingUser) {
                return res.status(400).json({
                    message: "Username is already taken"
                });
            }
        }

        // Update user profile
        const updateData = {
            name,
            username,
            location,
            updated_at: new Date().toISOString()
        };

        // Only update avatar_url if provided
        if (avatar_url !== undefined) {
            updateData.avatar_url = avatar_url;
        }

        const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return res.status(500).json({
                message: "Failed to update profile",
                error: updateError.message
            });
        }

        console.log('✅ Profile updated successfully for user:', user.id);

        return res.status(200).json({
            message: "Profile updated successfully",
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({
            message: "Failed to update user profile",
            error: error.message
        });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        // User is already authenticated via middleware
        const user = req.user;

        console.log('🔍 Fetching stats for user:', user.id);

        // Get trip statistics
        const { data: trips, error: tripsError } = await supabase
            .from('trips')
            .select(`
                id,
                stops (id),
                activities (id, estimated_cost)
            `)
            .eq('admin_id', user.id)
            .is('deleted_at', null);

        if (tripsError) {
            console.error('Stats error:', tripsError);
            return res.status(500).json({
                message: "Failed to fetch user stats",
                error: tripsError.message
            });
        }

        // Calculate statistics
        const totalTrips = trips.length;
        const totalDestinations = trips.reduce((acc, trip) => acc + (trip.stops?.length || 0), 0);
        const totalActivities = trips.reduce((acc, trip) => acc + (trip.activities?.length || 0), 0);
        const totalCost = trips.reduce((acc, trip) => 
            acc + (trip.activities?.reduce((sum, activity) => sum + (parseFloat(activity.estimated_cost) || 0), 0) || 0), 0
        );

        console.log('📊 User stats:', { totalTrips, totalDestinations, totalActivities, totalCost });

        return res.status(200).json({
            message: "User stats fetched successfully",
            stats: {
                totalTrips,
                totalDestinations,
                totalActivities,
                totalCost
            }
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        return res.status(500).json({
            message: "Failed to fetch user stats",
            error: error.message
        });
    }
};

// Get detailed view of a specific trip for the current user
const getUserTripDetails = async (req, res) => {
    try {
        // User is already authenticated via middleware
        const user = req.user;
        const { tripId } = req.params;

        console.log('🔍 Fetching trip details for user:', user.id, 'trip:', tripId);

        const { data: trip, error } = await supabase
            .from('trips')
            .select(`
                id,
                title,
                description,
                start_date,
                end_date,
                start_destination,
                end_destination,
                status,
                created_at,
                updated_at,
                users:admin_id (
                    id,
                    name,
                    avatar_url,
                    location
                ),
                stops (
                    id,
                    destination,
                    start_date,
                    end_date,
                    notes
                ),
                activities (
                    id,
                    activity,
                    description,
                    scheduled_at,
                    duration_minutes,
                    estimated_cost,
                    currency,
                    status,
                    stops:stop_id (
                        destination
                    )
                )
            `)
            .eq('id', tripId)
            .eq('admin_id', user.id) // Ensure user can only access their own trips
            .is('deleted_at', null);

        console.log('📋 Query result:', { data: trip, error });

        if (error) {
            console.error('❌ Database error:', error);
            return res.status(404).json({
                message: "Trip not found or access denied",
                error: error.message
            });
        }

        if (!trip || trip.length === 0) {
            console.log('❌ No trip found or access denied');
            return res.status(404).json({
                message: "Trip not found or access denied"
            });
        }

        // Take the first trip if array is returned
        const tripData = Array.isArray(trip) ? trip[0] : trip;
        
        console.log('✅ User trip found:', tripData.title);

        return res.status(200).json({
            message: "Trip details fetched successfully",
            trip: tripData
        });

    } catch (error) {
        console.error('Error fetching user trip details:', error);
        return res.status(500).json({
            message: "Failed to fetch trip details",
            error: error.message
        });
    }
};

// Make a user admin (for initial setup)
const makeUserAdmin = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Update user role to admin
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating user role:', updateError);
            return res.status(500).json({ 
                message: 'Failed to update user role', 
                error: updateError.message 
            });
        }

        return res.status(200).json({
            message: 'User successfully granted admin privileges',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error making user admin:', error);
        return res.status(500).json({
            message: "Failed to update user role",
            error: error.message
        });
    }
};

export { getUserTrips, getUserProfile, updateUserProfile, getUserStats, getUserTripDetails, makeUserAdmin };
