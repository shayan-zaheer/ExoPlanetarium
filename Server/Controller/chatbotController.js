const llmHandler = require("../Utils/AiUtils/llmHandler");
const { getVectors } = require("../Utils/AiUtils/pcQuery");

exports.handlePrompt = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const { userInp, convHistory = [] } = req.body;

        if (!userInp || userInp.trim().length === 0) {
            return res.status(400).json({
                status: "Error",
                message: "Please provide a valid question",
            });
        }

        const standaloneQues = await Promise.race([
            llmHandler.createQuestion(userInp, convHistory),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Question creation timeout")), 10000)
            )
        ]);
        console.log("Standalone question:", standaloneQues);

        const similarVecs = await getVectors(standaloneQues);
        console.log(`Found ${similarVecs.length} relevant matches`);

        if (!similarVecs || similarVecs.length === 0) {
            return res.status(200).json({
                status: "success",
                message: "Response Generated",
                data: {
                    content: "I don't have specific information about that topic in my exoplanet knowledge base. Please try asking about exoplanet discovery, characteristics, or recent findings.",
                    role: "assistant"
                },
            });
        }

        const nearestMatches = similarVecs
            .map(v => v.metadata?.text)
            .filter(text => text && text.length > 0)
            .join("\n\n");

        console.log("🤖 Generating response...");
        const result = await Promise.race([
            llmHandler.getFinalAns(nearestMatches, "", userInp),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Response generation timeout")), 15000)
            )
        ]);

        const responseTime = Date.now() - startTime;
        console.log(`Response generated in ${responseTime}ms`);

        res.status(200).json({
            status: "success",
            message: "Response Generated Successfully",
            data: {
                content: result,
                role: "assistant"
            },
            responseTime: `${responseTime}ms`
        });

    } catch (err) {
        const responseTime = Date.now() - startTime;
        console.error(`Error in handlePrompt (${responseTime}ms):`, err.message);
        
        res.status(200).json({
            status: "Success",
            message: "Response Generated",
            data: {
                content: "I'm experiencing some technical difficulties. Please try rephrasing your question or ask about exoplanet topics.",
                role: "assistant"
            },
            responseTime: `${responseTime}ms`
        });
    }
};
