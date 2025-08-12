import { supabase } from "../config/supabase.js";

// Get all public trips for community board
const getPublicTrips = async (req, res) => {
    try {
        console.log('🔍 Community API called with params:', req.query);
        
        // First, let's check if ANY trips exist at all
        const { data: allTrips, error: allTripsError } = await supabase
            .from('trips')
            .select('id, title, status, deleted_at');
            
        console.log('🗄️ All trips in database:', allTrips?.length || 0);
        console.log('📋 Sample trips:', allTrips?.slice(0, 3));
        
        const { page = 1, limit = 12, search = '', sort = 'created_at' } = req.query;
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
                    end_date
                ),
                activities (
                    id,
                    activity,
                    estimated_cost,
                    currency
                )
            `)
            .is('deleted_at', null)
            .range(offset, offset + limit - 1);

        console.log('🗄️ Initial query setup complete');

        // Add search functionality
        if (search) {
            console.log('🔍 Adding search filter for:', search);
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,start_destination.ilike.%${search}%,end_destination.ilike.%${search}%`);
        }

        // Add sorting
        if (sort === 'popular') {
            console.log('📊 Sorting by popularity');
            // For now, sort by number of activities as a popularity indicator
            query = query.order('created_at', { ascending: false });
        } else if (sort === 'newest') {
            console.log('🆕 Sorting by newest');
            query = query.order('created_at', { ascending: false });
        } else if (sort === 'oldest') {
            console.log('📅 Sorting by oldest');
            query = query.order('created_at', { ascending: true });
        } else {
            console.log('📋 Default sorting by created_at desc');
            query = query.order('created_at', { ascending: false });
        }

        console.log('🚀 Executing database query...');
        const { data: trips, error } = await query;

        if (error) {
            console.error('❌ Database error:', error);
            return res.status(500).json({
                message: "Failed to fetch public trips",
                error: error.message
            });
        }

        console.log('✅ Query successful! Found trips:', trips?.length || 0);
        console.log('📋 Trip data preview:', trips?.slice(0, 2));

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                message: "Failed to fetch public trips",
                error: error.message
            });
        }

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from('trips')
            .select('*', { count: 'exact', head: true })
            .is('deleted_at', null);

        if (countError) {
            console.error('Count error:', countError);
        }

        // Process trips to add calculated fields
        const processedTrips = trips.map(trip => {
            const totalStops = trip.stops?.length || 0;
            const totalActivities = trip.activities?.length || 0;
            const estimatedCost = trip.activities?.reduce((total, activity) => {
                return total + (parseFloat(activity.estimated_cost) || 0);
            }, 0) || 0;

            // Calculate trip duration
            const startDate = new Date(trip.start_date);
            const endDate = new Date(trip.end_date);
            const tripDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            return {
                ...trip,
                totalStops,
                totalActivities,
                estimatedCost,
                tripDuration,
                // Remove detailed stops and activities to reduce payload size
                stops: totalStops,
                activities: totalActivities
            };
        });

        console.log('📊 Processed trips count:', processedTrips.length);
        console.log('📈 Pagination info:', {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
        });

        return res.status(200).json({
            message: "Public trips fetched successfully",
            trips: processedTrips,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching public trips:', error);
        return res.status(500).json({
            message: "Failed to fetch public trips",
            error: error.message
        });
    }
};

// Get detailed view of a specific trip
const getTripDetails = async (req, res) => {
    try {
        const { tripId } = req.params;
        console.log('🔍 Fetching trip details for ID:', tripId);

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
            .is('deleted_at', null);

        console.log('📋 Query result:', { data: trip, error });

        if (error) {
            console.error('❌ Database error:', error);
            return res.status(404).json({
                message: "Trip not found or not public",
                error: error.message
            });
        }

        if (!trip || trip.length === 0) {
            console.log('❌ No trip found');
            return res.status(404).json({
                message: "Trip not found or not public"
            });
        }

        // Take the first trip if array is returned
        const tripData = Array.isArray(trip) ? trip[0] : trip;
        
        console.log('✅ Trip found:', tripData.title);

        return res.status(200).json({
            message: "Trip details fetched successfully",
            trip: tripData
        });

    } catch (error) {
        console.error('Error fetching trip details:', error);
        return res.status(500).json({
            message: "Failed to fetch trip details",
            error: error.message
        });
    }
};

// Copy a community trip to user's account
const copyTripToAccount = async (req, res) => {
    try {
        const { tripId } = req.params;
        
        // Get user from token
        const token = req.cookies['sb-access-token'];
        if (!token) {
            return res.status(401).json({ message: "No access token provided" });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        console.log('📋 Copying trip', tripId, 'for user', user.id);

        // First, get the original trip with all its data
        const { data: originalTrip, error: tripError } = await supabase
            .from('trips')
            .select(`
                admin_id,
                title,
                description,
                start_destination,
                end_destination,
                start_date,
                end_date,
                stops (
                    destination,
                    start_date,
                    end_date,
                    notes
                ),
                activities (
                    activity,
                    description,
                    scheduled_at,
                    duration_minutes,
                    estimated_cost,
                    currency,
                    stop_id,
                    stops:stop_id (
                        destination
                    )
                )
            `)
            .eq('id', tripId)
            .is('deleted_at', null)
            .single();

        if (tripError || !originalTrip) {
            console.log('❌ Trip not found:', tripError?.message);
            return res.status(404).json({
                message: "Trip not found or not accessible",
                error: tripError?.message
            });
        }

        // Check if user is trying to copy their own trip
        if (originalTrip.admin_id === user.id) {
            console.log('⚠️ User trying to copy their own trip, redirecting to edit');
            return res.status(400).json({
                message: "You cannot copy your own trip. You can edit it directly from your dashboard.",
                code: "OWN_TRIP_COPY_ATTEMPT",
                redirectToEdit: true,
                tripId: tripId
            });
        }

        // Create a new trip for the user
        const { data: newTrip, error: newTripError } = await supabase
            .from('trips')
            .insert([
                {
                    admin_id: user.id,
                    title: `${originalTrip.title} (Copy)`,
                    description: originalTrip.description,
                    start_destination: originalTrip.start_destination,
                    end_destination: originalTrip.end_destination,
                    start_date: originalTrip.start_date,
                    end_date: originalTrip.end_date,
                    status: 'draft' // Set as draft so user can edit
                }
            ])
            .select()
            .single();

        if (newTripError) {
            console.error('Error creating new trip:', newTripError);
            return res.status(500).json({
                message: "Failed to copy trip",
                error: newTripError.message
            });
        }

        // Copy stops if they exist
        if (originalTrip.stops && originalTrip.stops.length > 0) {
            const stopsToInsert = originalTrip.stops.map(stop => ({
                trip_id: newTrip.id,
                destination: stop.destination,
                start_date: stop.start_date,
                end_date: stop.end_date,
                notes: stop.notes
            }));

            const { error: stopsError } = await supabase
                .from('stops')
                .insert(stopsToInsert);

            if (stopsError) {
                console.error('Error copying stops:', stopsError);
            }
        }

        // Copy activities if they exist (without stop_id for now - user can reassign in editor)
        if (originalTrip.activities && originalTrip.activities.length > 0) {
            const activitiesToInsert = originalTrip.activities.map(activity => ({
                trip_id: newTrip.id,
                activity: activity.activity,
                description: activity.description,
                scheduled_at: activity.scheduled_at,
                duration_minutes: activity.duration_minutes,
                estimated_cost: activity.estimated_cost,
                currency: activity.currency
                // Note: stop_id is omitted as it would reference old trip's stops
            }));

            const { error: activitiesError } = await supabase
                .from('activities')
                .insert(activitiesToInsert);

            if (activitiesError) {
                console.error('Error copying activities:', activitiesError);
            }
        }

        console.log('✅ Trip copied successfully:', newTrip.id);

        return res.status(201).json({
            message: "Trip copied successfully to your account",
            trip: newTrip
        });

    } catch (error) {
        console.error('Error copying trip:', error);
        return res.status(500).json({
            message: "Failed to copy trip",
            error: error.message
        });
    }
};

export { getPublicTrips, getTripDetails, copyTripToAccount };
