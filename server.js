
const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/ask', async (req, res) => {
  const { question, state } = req.body;
  if (!question || !state) return res.status(400).json({ error: 'Missing question or state' });

  const prompt = `
You are a DOT (Department of Transportation) regulation expert assistant.
Answer clearly, concisely, and with specific guidance based on the state of ${state}.
If you’re unsure, direct the user to the official ${state} Department of Transportation website.

Question: "${question}"
  `;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
    });
    const reply = completion.data.choices[0].message.content;
    res.json({ answer: reply });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'OpenAI API failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
