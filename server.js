const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post('/api/claude', async (req, res) => {
  try {
    const userMessage = req.body.messages?.[0]?.content || '';

    const groqBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.3,
      max_tokens: req.body.max_tokens || 800,
    };

    console.log('Calling Groq...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(groqBody)
    });

    const data = await response.json();
    console.log('Groq status:', response.status);

    if (!response.ok) {
      console.log('Groq error:', JSON.stringify(data));
      return res.status(500).json({ error: data.error?.message || 'Groq API error' });
    }

    // Convert Groq response → Anthropic-style so HTML needs no changes
    const text = data.choices?.[0]?.message?.content || '';
    console.log('Groq reply preview:', text.slice(0, 100));
    res.json({ content: [{ type: 'text', text }] });

  } catch (err) {
    console.log('Server error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('✅ FeedbackIQ running at http://localhost:3000');
  console.log('   Powered by Groq (free tier) — llama3-8b-8192');
});