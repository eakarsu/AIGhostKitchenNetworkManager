const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(systemPrompt, userPrompt) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// POST /menu-optimization
router.post('/menu-optimization', async (req, res) => {
  try {
    const { brand_name, current_menu, platform_data } = req.body;
    const systemPrompt = 'You are an expert ghost kitchen menu optimization consultant. Analyze the menu and delivery platform data to provide specific, actionable recommendations for menu optimization. Format your response with clear sections: Performance Analysis, Recommended Changes, New Item Suggestions, and Pricing Adjustments.';
    const userPrompt = `Analyze the menu for "${brand_name}".\n\nCurrent Menu:\n${JSON.stringify(current_menu, null, 2)}\n\nPlatform Data:\n${JSON.stringify(platform_data, null, 2)}\n\nProvide detailed optimization recommendations.`;
    const result = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /brand-concept
router.post('/brand-concept', async (req, res) => {
  try {
    const { cuisine_type, target_market, location } = req.body;
    const systemPrompt = 'You are a creative virtual restaurant brand strategist specializing in ghost kitchens. Generate a complete virtual brand concept including: Brand Name, Tagline, Menu Theme, Target Demographics, Recommended Menu Items (with prices), Brand Voice & Personality, Social Media Strategy, and Competitive Advantages.';
    const userPrompt = `Create a virtual restaurant brand concept for:\n\nCuisine Type: ${cuisine_type}\nTarget Market: ${target_market}\nLocation: ${location}\n\nProvide a complete brand concept with all details.`;
    const result = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /demand-forecast
router.post('/demand-forecast', async (req, res) => {
  try {
    const { brand_name, location, historical_data } = req.body;
    const systemPrompt = 'You are a demand forecasting analyst for ghost kitchens. Analyze the data and provide detailed forecasts including: Peak Hours Prediction, Day-of-Week Trends, Seasonal Adjustments, Recommended Prep Quantities, Staffing Recommendations, and Inventory Planning suggestions. Use specific numbers and percentages.';
    const userPrompt = `Provide a demand forecast for "${brand_name}" located at ${location}.\n\nHistorical Data:\n${JSON.stringify(historical_data, null, 2)}\n\nProvide detailed demand forecasting with specific numbers.`;
    const result = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /sentiment-analysis
router.post('/sentiment-analysis', async (req, res) => {
  try {
    const { brand_name, reviews } = req.body;
    const systemPrompt = 'You are a customer review sentiment analysis expert for restaurants. Analyze the reviews and provide: Overall Sentiment Score (1-10), Key Positive Themes, Key Negative Themes, Urgent Issues to Address, Customer Satisfaction Trends, and Specific Actionable Improvements. Be specific and reference actual review content.';
    const userPrompt = `Analyze customer reviews for "${brand_name}".\n\nReviews:\n${JSON.stringify(reviews, null, 2)}\n\nProvide detailed sentiment analysis with actionable insights.`;
    const result = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /dynamic-pricing
router.post('/dynamic-pricing', async (req, res) => {
  try {
    const { brand_name, menu_items, demand_data, competitor_prices } = req.body;
    const systemPrompt = 'You are a dynamic pricing strategist for ghost kitchen delivery platforms. Analyze the data and provide: Current Price Analysis, Recommended Price Adjustments (with specific amounts), Peak/Off-Peak Pricing Strategy, Platform-Specific Pricing, Bundle/Combo Suggestions with prices, and Projected Revenue Impact.';
    const userPrompt = `Provide dynamic pricing recommendations for "${brand_name}".\n\nMenu Items:\n${JSON.stringify(menu_items, null, 2)}\n\nDemand Data:\n${JSON.stringify(demand_data, null, 2)}\n\nCompetitor Prices:\n${JSON.stringify(competitor_prices, null, 2)}\n\nProvide specific pricing strategies and recommendations.`;
    const result = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /social-media
router.post('/social-media', async (req, res) => {
  try {
    const { brand_name, brand_concept, target_audience, platform } = req.body;
    const systemPrompt = 'You are a social media content creator specializing in food brands and ghost kitchens. Create engaging social media content including: 5 Post Ideas with captions, Hashtag Strategy (15-20 relevant hashtags), Content Calendar (1 week), Story/Reel Concepts, Engagement Strategies, and Brand Voice Guidelines. Make content trendy and appetizing.';
    const userPrompt = `Create social media content for "${brand_name}".\n\nBrand Concept: ${brand_concept}\nTarget Audience: ${target_audience}\nPlatform: ${platform}\n\nProvide a complete social media content strategy.`;
    const result = await callOpenRouter(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
