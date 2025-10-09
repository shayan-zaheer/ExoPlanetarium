const axios = require("axios");

const openRouterAPI = axios.create({
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
        Authorization: `Bearer ${process.env.OR_TOKEN}`,
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

exports.getFinalAns = async (context, history, actualQuestion) => {
    try {
        const response = await openRouterAPI.post("/chat/completions", {
            model: "google/gemma-2-9b-it:free",
            messages: [
                {
                    role: "system",
                    content: `You are an exoplanet expert. Answer questions about exoplanets and space science. Use the provided context when relevant.

Context: ${context}`
                },
                {
                    role: "user",
                    content: actualQuestion
                }
            ],
            max_tokens: 300,
            temperature: 0.3,
        });

        const result = response.data.choices[0].message.content?.trim();
        return result || "I can help you learn about exoplanets. What would you like to know?";
        
    } catch (e) {
        console.error("Error:", e.message);
        return "I can help you learn about exoplanets. What would you like to know?";
    }
};