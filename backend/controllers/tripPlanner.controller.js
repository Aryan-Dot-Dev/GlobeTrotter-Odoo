import { supabase } from "../config/supabase.js";
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Updated to use stable Gemini model instead of experimental
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Create a new trip
const createTrip = async (req, res) => {
    try {
        const user = req.user;
        const { 
            title, 
            description, 
            startDate, 
            endDate, 
            startDestination, 
            endDestination,
            budget 
        } = req.body;

        console.log('🆕 Creating new trip for user:', user.id);

        // Validate required fields
        if (!title || !endDestination || !startDate || !endDate) {
            return res.status(400).json({
                message: "Missing required fields: title, endDestination, startDate, endDate"
            });
        }

        // Validate date range
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                message: "End date must be after start date"
            });
        }

        const { data: trip, error } = await supabase
            .from('trips')
            .insert([{
                admin_id: user.id,
                title,
                description: description || `Trip from ${startDestination || 'unknown'} to ${endDestination}`,
                start_date: startDate,
                end_date: endDate,
                start_destination: startDestination,
                end_destination: endDestination,
                status: 'draft'
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Database error creating trip:', error);
            return res.status(500).json({
                message: "Failed to create trip",
                error: error.message
            });
        }

        console.log('✅ Trip created successfully:', trip.id);

        return res.status(201).json({
            message: "Trip created successfully",
            trip
        });

    } catch (error) {
        console.error('Error creating trip:', error);
        return res.status(500).json({
            message: "Failed to create trip",
            error: error.message
        });
    }
};

// Create a new stop
const createStop = async (req, res) => {
    try {
        const user = req.user;
        const { tripId, destination, startDate, endDate, notes } = req.body;

        console.log('🛑 Creating stop for trip:', tripId);

        // Validate required fields
        if (!tripId || !destination) {
            return res.status(400).json({
                message: "Missing required fields: tripId, destination"
            });
        }

        // Verify trip ownership
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('admin_id')
            .eq('id', tripId)
            .single();

        if (tripError || !trip || trip.admin_id !== user.id) {
            return res.status(404).json({
                message: "Trip not found or access denied"
            });
        }

        const { data: stop, error } = await supabase
            .from('stops')
            .insert([{
                trip_id: tripId,
                destination,
                start_date: startDate,
                end_date: endDate,
                notes: notes || ''
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Database error creating stop:', error);
            return res.status(500).json({
                message: "Failed to create stop",
                error: error.message
            });
        }

        console.log('✅ Stop created successfully:', stop.id);

        return res.status(201).json({
            message: "Stop created successfully",
            stop
        });

    } catch (error) {
        console.error('Error creating stop:', error);
        return res.status(500).json({
            message: "Failed to create stop",
            error: error.message
        });
    }
};

// Create a new activity
const createActivity = async (req, res) => {
    try {
        const user = req.user;
        const { 
            tripId, 
            stopId, 
            activity, 
            description, 
            scheduledAt, 
            durationMinutes, 
            estimatedCost, 
            currency 
        } = req.body;

        console.log('🎯 Creating activity for trip:', tripId);

        // Validate required fields
        if (!tripId || !activity) {
            return res.status(400).json({
                message: "Missing required fields: tripId, activity"
            });
        }

        // Verify trip ownership
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('admin_id')
            .eq('id', tripId)
            .single();

        if (tripError || !trip || trip.admin_id !== user.id) {
            return res.status(404).json({
                message: "Trip not found or access denied"
            });
        }

        const { data: activityData, error } = await supabase
            .from('activities')
            .insert([{
                trip_id: tripId,
                stop_id: stopId,
                activity,
                description: description || '',
                scheduled_at: scheduledAt,
                duration_minutes: durationMinutes || 60,
                estimated_cost: estimatedCost || 0,
                currency: currency || 'INR',
                status: 'planned'
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Database error creating activity:', error);
            return res.status(500).json({
                message: "Failed to create activity",
                error: error.message
            });
        }

        console.log('✅ Activity created successfully:', activityData.id);

        return res.status(201).json({
            message: "Activity created successfully",
            activity: activityData
        });

    } catch (error) {
        console.error('Error creating activity:', error);
        return res.status(500).json({
            message: "Failed to create activity",
            error: error.message
        });
    }
};

// AI: Suggest places to visit
const suggestPlaces = async (req, res) => {
    try {
        const { startDestination, endDestination, duration } = req.body;

        console.log('🤖 AI suggesting places for:', { startDestination, endDestination, duration });

        const prompt = `
Please suggest places to visit between ${startDestination || 'any starting point'} and ${endDestination} for a ${duration} day trip.

Provide a JSON response with the following structure:
{
  "places": [
    {
      "name": "Place Name",
      "description": "Brief description of why this place is worth visiting"
    }
  ]
}

Consider:
- Popular tourist attractions and hidden gems
- Places that are accessible and well-connected
- Cultural significance and unique experiences
- Mix of different types of attractions (historical, natural, cultural)
- Practical travel routes between destinations

Provide 5-8 diverse place suggestions.`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        };

        const response = await axios.post(GEMINI_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const jsonResponse = JSON.parse(response.data.candidates[0].content.parts[0].text);
            
            return res.status(200).json({
                message: "Places suggested successfully",
                places: jsonResponse.places || []
            });
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }

    } catch (error) {
        console.error('Error suggesting places:', error);
        
        // Fallback places in case of API failure
        const fallbackPlaces = [
            {
                name: "Historic City Center",
                description: "Explore the historic heart of the city with beautiful architecture and local culture"
            },
            {
                name: "Local Markets",
                description: "Experience authentic local life and try traditional foods at bustling markets"
            },
            {
                name: "Cultural Museums",
                description: "Discover the rich history and art collections in world-class museums"
            },
            {
                name: "Scenic Viewpoints",
                description: "Enjoy breathtaking views and perfect photo opportunities"
            }
        ];

        return res.status(200).json({
            message: "Places suggested successfully (fallback)",
            places: fallbackPlaces,
            note: "Using fallback suggestions due to AI service unavailability"
        });
    }
};

// AI: Suggest activities for a place
const suggestActivities = async (req, res) => {
    const { place, budget, duration } = req.body;
    
    try {
        console.log('🤖 AI suggesting activities for:', { place, budget, duration });

        const prompt = `
Please suggest activities to do in ${place} for travelers.

${budget ? `Budget consideration: $${budget} total for ${duration} days` : ''}

Provide a JSON response with the following structure:
{
  "activities": [
    {
      "name": "Activity Name",
      "description": "Brief description of the activity",
      "estimatedCost": 25,
      "duration": 120
    }
  ]
}

Consider:
- Mix of cultural, adventure, relaxation, and local experiences
- Different price points and time commitments
- Activities suitable for most travelers
- Unique experiences specific to ${place}
- Realistic cost estimates in INR
- Duration in minutes (be realistic: walking tours 120-180 min, museum visits 90-150 min, meals 60-90 min, etc.)
- Include travel time between activities if they're in different areas

Provide 4-6 diverse activity suggestions with realistic time estimates.`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        };

        const response = await axios.post(GEMINI_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const jsonResponse = JSON.parse(response.data.candidates[0].content.parts[0].text);
            
            // Filter by budget if provided
            let activities = jsonResponse.activities || [];
            if (budget && duration) {
                const dailyBudget = parseFloat(budget) / duration;
                activities = activities.filter(activity => 
                    activity.estimatedCost <= dailyBudget * 0.3 // Max 30% of daily budget per activity
                );
            }
            
            return res.status(200).json({
                message: "Activities suggested successfully",
                activities
            });
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }

    } catch (error) {
        console.error('Error suggesting activities:', error);
        
        // Fallback activities in case of API failure
        const fallbackActivities = [
            {
                name: "Walking Tour",
                description: "Guided walking tour of the main attractions",
                estimatedCost: 25,
                duration: 120
            },
            {
                name: "Local Restaurant Experience",
                description: "Try authentic local cuisine at a recommended restaurant",
                estimatedCost: 40,
                duration: 90
            },
            {
                name: "Cultural Site Visit",
                description: "Visit important cultural or historical sites",
                estimatedCost: 15,
                duration: 180
            },
            {
                name: "Local Market Shopping",
                description: "Browse local markets and shop for souvenirs",
                estimatedCost: 30,
                duration: 90
            }
        ];

        // Filter by budget if provided
        let filteredActivities = fallbackActivities;
        if (budget && duration) {
            const dailyBudget = parseFloat(budget) / duration;
            filteredActivities = fallbackActivities.filter(activity => 
                activity.estimatedCost <= dailyBudget * 0.3
            );
        }

        return res.status(200).json({
            message: "Activities suggested successfully (fallback)",
            activities: filteredActivities,
            note: "Using fallback suggestions due to AI service unavailability"
        });
    }
};

// AI: Auto-schedule activities
const autoSchedule = async (req, res) => {
    const { activities, startDate, endDate, places } = req.body;
    
    try {
        console.log('🤖 AI auto-scheduling request received:', { 
            activitiesCount: activities?.length || 0, 
            activities: activities,
            startDate, 
            endDate, 
            placesCount: places?.length || 0 
        });

        // Input validation
        if (!activities || !Array.isArray(activities) || activities.length === 0) {
            console.log('❌ No activities provided for scheduling');
            return res.status(400).json({
                message: "No activities provided for scheduling",
                scheduledActivities: [],
                debug: { activitiesProvided: activities }
            });
        }

        if (!startDate || !endDate) {
            console.log('❌ Missing date information');
            return res.status(400).json({
                message: "Start date and end date are required",
                scheduledActivities: []
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        const prompt = `
IMPORTANT: You must ONLY schedule the exact activities provided below. Do NOT add any new activities, suggestions, or recommendations.

Task: Create an optimized schedule for ONLY the following ${activities.length} activities during a ${totalDays}-day trip from ${startDate} to ${endDate}.

ACTIVITIES TO SCHEDULE (DO NOT ADD ANY OTHERS):
${activities.map((activity, index) => 
    `${index + 1}. ${activity.name} at ${activity.place} (${activity.duration} minutes, ₹${activity.estimatedCost})`
).join('\n')}

STRICT REQUIREMENTS:
- ONLY use the ${activities.length} activities listed above
- Do NOT add any new activities, meals, rest periods, or suggestions
- Do NOT include travel time, breaks, or additional recommendations
- Every activity in your response MUST be from the list above
- The response must contain exactly ${activities.length} activities
- Only assign dates and times to the provided activities

OUTPUT FORMAT (JSON only):
{
  "scheduledActivities": [
    {
      "id": "activity_id",
      "name": "Exact Activity Name from List",
      "place": "Exact Place Name from List", 
      "description": "Activity description",
      "estimatedCost": cost_number,
      "duration": duration_in_minutes,
      "scheduledDate": "YYYY-MM-DD",
      "scheduledTime": "HH:MM"
    }
  ]
}

SCHEDULING GUIDELINES:
- Group activities by location when possible
- Use realistic times (09:00-18:00 typically)
- Space activities appropriately based on duration
- Distribute across available days
- Consider logical timing (morning/afternoon/evening suitability)

Remember: Return EXACTLY ${activities.length} activities. Do NOT add extras.`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.5,
                maxOutputTokens: 3072
            }
        };

        console.log('📡 Calling Gemini API with:', {
            apiUrl: GEMINI_API_URL,
            hasApiKey: !!GEMINI_API_KEY,
            activitiesCount: activities.length
        });

        const response = await axios.post(GEMINI_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 Gemini API Response Status:', response.status);
        console.log('📡 Gemini API Response Structure:', {
            hasCandidates: !!response.data?.candidates,
            candidatesCount: response.data?.candidates?.length || 0,
            hasContent: !!response.data?.candidates?.[0]?.content,
            hasParts: !!response.data?.candidates?.[0]?.content?.parts,
            hasText: !!response.data?.candidates?.[0]?.content?.parts?.[0]?.text
        });

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const rawText = response.data.candidates[0].content.parts[0].text;
            console.log('📡 Raw Gemini Response:', rawText.substring(0, 500) + '...');
            
            try {
                const jsonResponse = JSON.parse(rawText);
                console.log('📡 Parsed JSON Response:', jsonResponse);
                
                // Validate that AI returned exactly the activities we sent
                const aiActivities = jsonResponse.scheduledActivities || [];
                
                console.log(`📊 AI Scheduling Validation:
                    - Input activities: ${activities.length}
                    - AI returned activities: ${aiActivities.length}
                    - Expected match: ${activities.length === aiActivities.length ? '✅' : '❌'}`);
                
                if (aiActivities.length === 0) {
                    console.log('⚠️ AI returned empty scheduledActivities array');
                }
                
                // Filter to only include activities that match our input
                const validActivities = aiActivities.filter(aiActivity => {
                    const matchFound = activities.some(inputActivity => 
                        inputActivity.name === aiActivity.name && 
                        inputActivity.place === aiActivity.place
                    );
                    
                    if (!matchFound) {
                        console.log(`❌ No match found for AI activity: "${aiActivity.name}" at "${aiActivity.place}"`);
                        console.log('Available input activities:', activities.map(a => `"${a.name}" at "${a.place}"`));
                    }
                    
                    return matchFound;
                });
                
                console.log(`📋 Activity Validation:
                    - Valid activities: ${validActivities.length}
                    - Filtered out: ${aiActivities.length - validActivities.length}`);
                
                if (validActivities.length === 0) {
                    console.log('🚨 No valid activities after filtering! Using fallback.');
                    throw new Error('No valid activities after filtering');
                }
                
                return res.status(200).json({
                    message: "Activities scheduled successfully",
                    scheduledActivities: validActivities
                });
                
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError.message);
                console.log('Raw response that failed to parse:', rawText);
                throw new Error('Failed to parse Gemini API response as JSON');
            }
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }

    } catch (error) {
        console.error('❌ Error auto-scheduling:', error.message);
        console.error('❌ Full error:', error);
        
        // Additional validation before fallback
        if (!activities || activities.length === 0) {
            console.log('❌ Cannot use fallback: No activities provided');
            return res.status(400).json({
                message: "No activities provided for scheduling",
                scheduledActivities: [],
                error: "No input activities to schedule"
            });
        }
        
        // Fallback: Simple auto-scheduling algorithm using ONLY the input activities
        console.log('🔄 Using fallback scheduling for', activities.length, 'activities');
        console.log('🔄 Fallback input activities:', activities.map(a => `${a.name} at ${a.place}`));
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        // Schedule ONLY the provided activities (no additions)
        const scheduledActivities = activities.map((activity, index) => {
            const dayIndex = Math.floor(index / Math.ceil(activities.length / totalDays));
            const activityDate = new Date(start);
            activityDate.setDate(activityDate.getDate() + dayIndex);

            // Distribute activities throughout the day
            const timeSlots = ['09:00', '11:00', '14:00', '16:00', '18:00'];
            const timeIndex = index % timeSlots.length;

            return {
                ...activity,
                scheduledDate: activityDate.toISOString().split('T')[0],
                scheduledTime: timeSlots[timeIndex]
            };
        });

        console.log('🔄 Fallback generated', scheduledActivities.length, 'scheduled activities');

        return res.status(200).json({
            message: "Activities scheduled successfully (fallback)",
            scheduledActivities,
            note: "Using fallback scheduling due to AI service unavailability",
            debug: {
                originalError: error.message,
                fallbackCount: scheduledActivities.length
            }
        });
    }
};

export { 
    createTrip, 
    createStop, 
    createActivity, 
    suggestPlaces, 
    suggestActivities, 
    autoSchedule 
};
