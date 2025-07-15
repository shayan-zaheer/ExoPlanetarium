const axios = require("axios");

const openRouterAPI = axios.create({
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
        Authorization: `Bearer ${process.env.OR_TOKEN}`,
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

exports.createQuestion = async (userInp) => {
    try {
        const response = await openRouterAPI.post("/chat/completions", {
            model: "google/gemma-2-9b-it:free",
            messages: [
                {
                    role: "system",
                    content:
                        "Convert the user's question into a clear, standalone search query. Return only the query, nothing else.",
                },
                { role: "user", content: userInp },
            ],
            max_tokens: 100,
            temperature: 0.1,
        });

        console.log("✅ OpenRouter response received");
        const result = response.data.choices[0].message.content.trim();
        console.log("🎯 Standalone question created:", result);
        return result;
    } catch (e) {
        console.error("❌ Error in createQuestion:");
        console.error("Status:", e.response?.status);
        console.error("Data:", e.response?.data);
        console.error("Message:", e.message);

        if (e.response?.status === 401) {
            console.log("🔑 Authentication error - check OR_TOKEN");
        } else if (e.response?.status === 429) {
            console.log("⏱️ Rate limit exceeded");
        } else if (e.response?.status === 503) {
            console.log("🔧 Service unavailable");
        } else if (e.code === "ECONNREFUSED") {
            console.log("🌐 Network connection failed");
        }

        console.log("🔄 Falling back to original input");
        return userInp;
    }
};

exports.getFinalAns = async (context, history, actualQuestion) => {
    try {
        const response = await openRouterAPI.post("/chat/completions", {
            model: "google/gemma-2-9b-it:free",
            messages: [
                {
                    role: "system",
                    content: `You are an exoplanet expert. Answer based only on the provided context. Be concise and informative.

Context: ${context}`,
                },
                { role: "user", content: actualQuestion },
            ],
            max_tokens: 300,
            temperature: 0.2,
        });

        return response.data.choices[0].message.content.trim();
    } catch (e) {
        console.error("Error in getFinalAns:", e.response?.data || e.message);
        return "I'm having trouble accessing the information right now. Please try asking your question again.";
    }
};
