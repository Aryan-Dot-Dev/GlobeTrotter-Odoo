import axios from 'axios';

const BACKEND_URL = 'http://localhost:3000'; // Your backend URL

export const getSuggestedStops = async (startDestination, endDestination, duration = '3-5 days') => {
  try {
    const prompt = `
Please suggest places to explore between ${startDestination} and ${endDestination} and also in ${endDestination} for a ${duration} trip.

Provide a detailed JSON response with the following structure:
{
  "route": {
    "start": "${startDestination}",
    "end": "${endDestination}",
    "estimated_total_duration": "X days",
    "total_estimated_cost_inr": XXXX
  },
  "suggested_stops": [
    {
      "place_name": "Place Name",
      "description": "Brief description of the place",
      "distance_from_start": "X km",
      "recommended_duration": "X days",
      "activities": [
        {
          "activity_name": "Activity Name",
          "description": "Activity description",
          "estimated_cost_inr": XXXX,
          "duration": "X hours"
        }
      ],
      "accommodation_cost_per_night_inr": XXXX,
      "food_cost_per_day_inr": XXXX,
      "local_transport_cost_inr": XXXX,
      "total_estimated_cost_inr": XXXX
    }
  ],
  "travel_tips": [
    "Tip 1",
    "Tip 2"
  ],
  "best_time_to_visit": "Season/Month",
  "transportation_options": [
    {
      "mode": "Bus/Train/Flight",
      "estimated_cost_inr": XXXX,
      "duration": "X hours"
    }
  ]
}

Consider:
- Popular tourist attractions and hidden gems
- Local culture and experiences
- Budget-friendly options
- Travel connectivity between places
- Seasonal considerations
- Activities suitable for different age groups
- Local cuisine experiences
- All costs should be in Indian Rupees (INR)
`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 4096
      }
    };

    const response = await axios.post(
      `${BACKEND_URL}/api/gemini/suggestions`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const jsonResponse = JSON.parse(response.data.candidates[0].content.parts[0].text);
            return {
                success: true,
                data: jsonResponse
            };
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }

    } catch (error) {
        console.error('Error fetching suggested stops:', error);

        // Return fallback data in case of API failure
        return {
            success: false,
            error: error.message,
            fallback: {
                route: {
                    start: startDestination,
                    end: endDestination,
                    estimated_total_duration: duration,
                    total_estimated_cost_inr: 15000
                },
                suggested_stops: [
                    {
                        place_name: `Midway Point between ${startDestination} and ${endDestination}`,
                        description: "A scenic stop along your journey",
                        distance_from_start: "150 km",
                        recommended_duration: "1-2 days",
                        activities: [
                            {
                                activity_name: "Local Sightseeing",
                                description: "Explore local attractions",
                                estimated_cost_inr: 1000,
                                duration: "4-6 hours"
                            }
                        ],
                        accommodation_cost_per_night_inr: 2000,
                        food_cost_per_day_inr: 800,
                        local_transport_cost_inr: 500,
                        total_estimated_cost_inr: 4300
                    }
                ],
                travel_tips: [
                    "Book accommodations in advance",
                    "Carry local currency",
                    "Check weather conditions"
                ],
                best_time_to_visit: "October to March",
                transportation_options: [
                    {
                        mode: "Bus",
                        estimated_cost_inr: 1000,
                        duration: "6-8 hours"
                    }
                ]
            }
        };
    }
};

export default getSuggestedStops;

