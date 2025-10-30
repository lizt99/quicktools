import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config as loadEnv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  // eslint-disable-next-line no-console
  console.warn('Warning: OPENAI_API_KEY is not set. Set it in a .env file or environment.');
}
const openai = new OpenAI({ apiKey: openaiApiKey });

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

function applyTemplate(template, replacements) {
  let result = template || '';
  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value ?? '');
  }
  return result;
}

app.post('/api/test', async (req, res) => {
  try {
    const { serviceContext, promptTemplate, postTitle, postBody, model } = req.body || {};
    const finalPrompt = applyTemplate(promptTemplate, {
      agent_setting_query: serviceContext ?? '',
      post_title: postTitle ?? '',
      post_selftext: postBody ?? ''
    });

    if (!openaiApiKey) {
      return res.status(400).json({ error: 'OPENAI_API_KEY not configured on server.' });
    }

    if (!finalPrompt || !finalPrompt.trim()) {
      return res.status(400).json({ error: 'Prompt is empty after replacements.' });
    }

    const modelToUse = model || 'gpt-4o-mini';

    const response = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: 'You are a helpful assistant for prompt testing.' },
        { role: 'user', content: finalPrompt }
      ],
      temperature: 0.7
    });

    const message = response.choices?.[0]?.message?.content ?? '';
    return res.json({ result: message, prompt: finalPrompt });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    const message = err?.response?.data || err?.message || 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`PromptTester running at http://localhost:${port}`);
});


