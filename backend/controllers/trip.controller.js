import { supabase } from "../config/supabase.js";
const addTrip = async (req, res) => {
    const token = req.cookies['sb-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    const { data: user, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description, start_destination, end_destination, start_date, end_date, status } = req.body;
    
    console.log('📥 Trip creation request:', {
        title, description, start_destination, end_destination, start_date, end_date, status,
        user_id: user.user.id
    });
    
    if (!title || !description || !start_destination || !end_destination || !start_date || !end_date || !status ) {
        console.log('❌ Missing required fields for trip creation');
        return res.status(400).json({ message: 'All fields are required' });
    }

    const { data, error } = await supabase
        .from('trips')
        .insert([
            { admin_id: user.user.id, title, description, start_destination, end_destination, start_date, end_date, status, updated_at: new Date() }
        ]).select();

    if (error) {
        console.error('❌ Supabase error creating trip:', error);
        return res.status(500).json({ message: 'Error creating trip', error });
    }

    console.log('✅ Trip created successfully:', data);
    return res.status(201).json({ message: 'Trip created successfully', trip: data });
}

const addStops = async (req, res) => {
    const { trip_id, stops } = req.body;
    console.log(trip_id, stops)

    // Validate required fields
    if (!trip_id || !stops || !Array.isArray(stops) || stops.length === 0) {
        return res.status(400).json({
            message: "trip_id and stops array are required"
        });
    }

    // Get user from token
    const token = req.cookies['sb-access-token'];
    if (!token) {
        return res.status(401).json({ message: "No access token provided" });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
        // Validate each stop and prepare for database insertion
        const stopsToInsert = stops.map(stop => {
            const { destination, start_date, end_date, notes } = stop;

            if (!destination || !start_date || !end_date) {
                throw new Error("Each stop must have destination, start_date, and end_date");
            }

            return {
                trip_id,
                destination,
                start_date,
                end_date,
                notes: notes || null
            };
        });

        // Insert all stops in one database call
        const { data, error } = await supabase
            .from('stops')
            .insert(stopsToInsert)
            .select();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                message: "Failed to add stops",
                error: error.message
            });
        }

        return res.status(201).json({
            message: `Successfully added ${data.length} stops`,
            stops: data
        });

    } catch (error) {
        console.error('Error adding stops:', error);
        return res.status(400).json({
            message: error.message || "Invalid stop data"
        });
    }
};

const addActivities = async (req, res) => {
    const { trip_id, activities } = req.body;

    if (!trip_id || !activities || !Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({
            message: "trip_id and activities array are required"
        });
    }

    const token = req.cookies['sb-access-token'];
    if (!token) {
        return res.status(401).json({ message: "No access token provided" });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
        // First, get all stops for this trip to validate stop_ids
        const { data: tripStops, error: stopsError } = await supabase
            .from('stops')
            .select('id')
            .eq('trip_id', trip_id);

        if (stopsError) {
            return res.status(500).json({
                message: "Failed to fetch trip stops",
                error: stopsError.message
            });
        }

        const validStopIds = tripStops.map(stop => stop.id);

        // Validate each activity and prepare for database insertion
        const activitiesToInsert = activities.map(activity => {
            const {
                stop_id,
                activity: activityName,
                description,
                scheduled_at,
                duration_minutes,
                estimated_cost,
                currency,
                status
            } = activity;

            if (!stop_id || !activityName || !scheduled_at) {
                throw new Error("Each activity must have stop_id, activity name, and scheduled_at");
            }

            // Validate that stop_id belongs to this trip
            if (!validStopIds.includes(stop_id)) {
                throw new Error(`Invalid stop_id: ${stop_id} does not belong to trip ${trip_id}`);
            }

            const activityToInsert = {
                trip_id, // Add trip_id to each activity record
                stop_id,
                activity: activityName,
                description: description || null,
                scheduled_at,
                duration_minutes: duration_minutes ? parseInt(duration_minutes) : null,
                estimated_cost: estimated_cost ? parseFloat(estimated_cost) : null,
                currency: currency || 'INR',
                status: status || 'planned'
            };

            console.log('Activity to insert:', activityToInsert);
            return activityToInsert;
        });

        console.log('All activities to insert:', activitiesToInsert);

        // Insert all activities in one database call
        const { data, error } = await supabase
            .from('activities')
            .insert(activitiesToInsert)
            .select(`
                *,
                stops:stop_id (
                    destination
                )
            `);

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                message: "Failed to add activities",
                error: error.message
            });
        }

        return res.status(201).json({
            message: `Successfully added ${data.length} activities`,
            activities: data
        });

    } catch (error) {
        console.error('Error adding activities:', error);
        return res.status(400).json({
            message: error.message || "Invalid activity data"
        });
    }
}

const deleteTrip = async (req, res) => {
    const { tripId } = req.params;
    const token = req.cookies['sb-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    const { data: user, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!tripId) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    try {
        // First verify the trip belongs to the user
        const { data: tripData, error: tripError } = await supabase
            .from('trips')
            .select('admin_id')
            .eq('id', tripId)
            .single();

        if (tripError || !tripData) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (tripData.admin_id !== user.user.id) {
            return res.status(403).json({ message: 'You can only delete your own trips' });
        }

        // Delete activities first (foreign key constraint)
        // Get all stop IDs for this trip first
        const { data: tripStops, error: getStopsError } = await supabase
            .from('stops')
            .select('id')
            .eq('trip_id', tripId);

        if (getStopsError) {
            console.error('Error getting trip stops:', getStopsError);
            return res.status(500).json({ 
                message: 'Error retrieving trip stops', 
                error: getStopsError.message 
            });
        }

        // Delete activities by both trip_id and stop_id to ensure we get all activities
        if (tripStops && tripStops.length > 0) {
            const stopIds = tripStops.map(stop => stop.id);
            
            // Delete activities by stop_id (most reliable method)
            const { error: activitiesByStopError } = await supabase
                .from('activities')
                .delete()
                .in('stop_id', stopIds);

            if (activitiesByStopError) {
                console.error('Error deleting activities by stop_id:', activitiesByStopError);
                return res.status(500).json({ 
                    message: 'Error deleting trip activities', 
                    error: activitiesByStopError.message 
                });
            }
        }

        // Also delete any activities directly linked to trip_id (fallback)
        const { error: activitiesByTripError } = await supabase
            .from('activities')
            .delete()
            .eq('trip_id', tripId);

        if (activitiesByTripError) {
            console.error('Error deleting activities by trip_id:', activitiesByTripError);
            // Don't return error here since the main deletion by stop_id should have worked
        }

        // Delete stops second (foreign key constraint)
        const { error: stopsError } = await supabase
            .from('stops')
            .delete()
            .eq('trip_id', tripId);

        if (stopsError) {
            console.error('Error deleting stops:', stopsError);
            return res.status(500).json({ 
                message: 'Error deleting trip stops', 
                error: stopsError.message 
            });
        }

        // Finally delete the trip
        const { error: deleteError } = await supabase
            .from('trips')
            .delete()
            .eq('id', tripId);

        if (deleteError) {
            console.error('Error deleting trip:', deleteError);
            return res.status(500).json({ 
                message: 'Error deleting trip', 
                error: deleteError.message 
            });
        }

        return res.status(200).json({ 
            message: 'Trip deleted successfully',
            tripId: tripId
        });

    } catch (error) {
        console.error('Error in deleteTrip:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

const updateTrip = async (req, res) => {
    const { tripId } = req.params;
    const token = req.cookies['sb-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    const { data: user, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description, startDestination, endDestination, startDate, endDate, budget } = req.body;
    
    if (!tripId) {
        return res.status(400).json({ message: 'Trip ID is required' });
    }

    try {
        // First verify the trip belongs to the user
        const { data: tripData, error: tripError } = await supabase
            .from('trips')
            .select('admin_id')
            .eq('id', tripId)
            .single();

        if (tripError || !tripData) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (tripData.admin_id !== user.user.id) {
            return res.status(403).json({ message: 'You can only update your own trips' });
        }

        // Update the trip
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (startDestination !== undefined) updateData.start_destination = startDestination;
        if (endDestination !== undefined) updateData.end_destination = endDestination;
        if (startDate !== undefined) updateData.start_date = startDate;
        if (endDate !== undefined) updateData.end_date = endDate;
        if (budget !== undefined) updateData.budget = budget;
        updateData.updated_at = new Date();

        const { data, error: updateError } = await supabase
            .from('trips')
            .update(updateData)
            .eq('id', tripId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating trip:', updateError);
            return res.status(500).json({ 
                message: 'Error updating trip', 
                error: updateError.message 
            });
        }

        return res.status(200).json({ 
            message: 'Trip updated successfully',
            trip: data
        });

    } catch (error) {
        console.error('Error in updateTrip:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

const deleteStopsByTrip = async (req, res) => {
    const { tripId } = req.params;
    const token = req.cookies['sb-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    const { data: user, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify the trip belongs to the user
        const { data: tripData, error: tripError } = await supabase
            .from('trips')
            .select('admin_id')
            .eq('id', tripId)
            .single();

        if (tripError || !tripData) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (tripData.admin_id !== user.user.id) {
            return res.status(403).json({ message: 'You can only delete stops from your own trips' });
        }

        // Delete stops for this trip
        const { error: deleteError } = await supabase
            .from('stops')
            .delete()
            .eq('trip_id', tripId);

        if (deleteError) {
            console.error('Error deleting stops:', deleteError);
            return res.status(500).json({ 
                message: 'Error deleting stops', 
                error: deleteError.message 
            });
        }

        return res.status(200).json({ 
            message: 'Stops deleted successfully for trip',
            tripId: tripId
        });

    } catch (error) {
        console.error('Error in deleteStopsByTrip:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

const deleteActivitiesByTrip = async (req, res) => {
    const { tripId } = req.params;
    const token = req.cookies['sb-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    const { data: user, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify the trip belongs to the user
        const { data: tripData, error: tripError } = await supabase
            .from('trips')
            .select('admin_id')
            .eq('id', tripId)
            .single();

        if (tripError || !tripData) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (tripData.admin_id !== user.user.id) {
            return res.status(403).json({ message: 'You can only delete activities from your own trips' });
        }

        // Delete activities for this trip
        const { error: deleteError } = await supabase
            .from('activities')
            .delete()
            .eq('trip_id', tripId);

        if (deleteError) {
            console.error('Error deleting activities:', deleteError);
            return res.status(500).json({ 
                message: 'Error deleting activities', 
                error: deleteError.message 
            });
        }

        return res.status(200).json({ 
            message: 'Activities deleted successfully for trip',
            tripId: tripId
        });

    } catch (error) {
        console.error('Error in deleteActivitiesByTrip:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

const bookPredefinedItinerary = async (req, res) => {
    const token = req.cookies['sb-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    const { data: user, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, description, start_destination, end_destination, start_date, end_date, stops, activities } = req.body;
    
    console.log('📥 Predefined itinerary booking request:', {
        title, description, start_destination, end_destination, start_date, end_date,
        stopsCount: stops?.length || 0,
        activitiesCount: activities?.length || 0,
        user_id: user.user.id
    });
    
    if (!title || !description || !start_destination || !end_destination || !start_date || !end_date) {
        console.log('❌ Missing required fields for predefined itinerary booking');
        return res.status(400).json({ message: 'All required fields must be provided' });
    }

    try {
        // Create the trip first
        const { data: tripData, error: tripError } = await supabase
            .from('trips')
            .insert([
                { 
                    admin_id: user.user.id, 
                    title, 
                    description, 
                    start_destination, 
                    end_destination, 
                    start_date, 
                    end_date, 
                    status: 'active',
                    updated_at: new Date() 
                }
            ])
            .select()
            .single();

        if (tripError) {
            console.error('❌ Supabase error creating trip:', tripError);
            return res.status(500).json({ message: 'Error creating trip', error: tripError });
        }

        console.log('✅ Trip created successfully:', tripData);
        const tripId = tripData.id;
        let firstStopId = null;

        // Add stops if provided
        if (stops && stops.length > 0) {
            const stopsWithTripId = stops.map(stop => ({
                trip_id: tripId,
                destination: stop.destination,
                start_date: stop.start_date,
                end_date: stop.end_date,
                notes: stop.notes || null
            }));

            const { data: stopsData, error: stopsError } = await supabase
                .from('stops')
                .insert(stopsWithTripId)
                .select();

            if (stopsError) {
                console.error('❌ Error creating stops:', stopsError);
                // Cleanup: delete the created trip
                await supabase.from('trips').delete().eq('id', tripId);
                return res.status(500).json({ message: 'Error creating stops', error: stopsError });
            }

            console.log('✅ Stops created successfully:', stopsData.length);
            firstStopId = stopsData[0]?.id; // Get the first stop ID for activities
        }

        // Add activities if provided and we have a stop to attach them to
        if (activities && activities.length > 0 && firstStopId) {
            const activitiesWithTripId = activities.map(activity => ({
                trip_id: tripId,
                stop_id: firstStopId, // Assign all activities to the first stop
                activity: activity.name,
                description: activity.description || '',
                scheduled_at: `${activity.date}T${activity.time}:00.000Z`,
                duration_minutes: 360, // Default 6 hours
                estimated_cost: activity.cost || 0,
                currency: 'INR',
                status: 'planned'
            }));

            const { data: activitiesData, error: activitiesError } = await supabase
                .from('activities')
                .insert(activitiesWithTripId)
                .select();

            if (activitiesError) {
                console.error('❌ Error creating activities:', activitiesError);
                // Cleanup: delete the created trip and stops
                await supabase.from('trips').delete().eq('id', tripId);
                return res.status(500).json({ message: 'Error creating activities', error: activitiesError });
            }

            console.log('✅ Activities created successfully:', activitiesData.length);
        }

        return res.status(201).json({ 
            message: 'Predefined itinerary booked successfully', 
            trip: tripData,
            stopsCount: stops?.length || 0,
            activitiesCount: activities?.length || 0
        });

    } catch (error) {
        console.error('❌ Error in bookPredefinedItinerary:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

export { addTrip, addStops, addActivities, deleteTrip, updateTrip, deleteStopsByTrip, deleteActivitiesByTrip, bookPredefinedItinerary };