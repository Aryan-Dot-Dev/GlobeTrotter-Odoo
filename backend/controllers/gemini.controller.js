import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// General Gemini API call function
const callGeminiAPI = async (prompt, responseFormat = "application/json") => {
    try {
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseMimeType: responseFormat,
                temperature: 0.7,
                maxOutputTokens: 4096
            }
        };

        const response = await axios.post(GEMINI_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            if (responseFormat === "application/json") {
                return JSON.parse(response.data.candidates[0].content.parts[0].text);
            } else {
                return response.data.candidates[0].content.parts[0].text;
            }
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }

    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
};

// Gemini suggestions endpoint (for backward compatibility)
const geminiSuggestions = async (req, res) => {
    try {
        const requestBody = req.body;
        
        const response = await axios.post(GEMINI_API_URL, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return res.status(200).json(response.data);

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return res.status(500).json({
            message: "Failed to get Gemini suggestions",
            error: error.message
        });
    }
};

export { callGeminiAPI, geminiSuggestions };
