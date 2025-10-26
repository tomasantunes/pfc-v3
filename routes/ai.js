var express = require('express');
var router = express.Router();
const { getChatResponseSearch } = require('../libs/openai');

router.post('/api/ai/get-investment-advice', async (req, res) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({ status: "NOK", error: "Invalid Authorization." });
    }

    var budget = req.body.budget;
    var portfolio_overview = req.body.portfolio_overview;
    var risk_level = req.body.risk_level;

    var prompt = `I have a budget of ${budget} to invest. Here is an overview of my current investment portfolio: ${portfolio_overview}. Based on this information and the current news, tell me what should I invest in today according to my risk level of ${risk_level}. Provide specific investment recommendations and justify them with recent market trends.`;

    var answer = await getChatResponseSearch(prompt);
    if (answer == null) {
        return res.json({ status: "NOK", error: "Error getting investment advice." });
    }

    res.json({ status: "OK", data: answer });
});

module.exports = router;