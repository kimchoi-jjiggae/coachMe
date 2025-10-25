// Vercel serverless function for OpenAI title generation
// This works with GitHub Pages by providing a CORS-enabled API endpoint

export default async function handler(req, res) {
  // Enable CORS for GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required' });
  }

  // Get OpenAI API key from environment
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured',
      details: 'Please set OPENAI_API_KEY environment variable in Vercel'
    });
  }

  try {
    // Truncate content if too long (OpenAI has token limits)
    const maxLength = 2000;
    const truncatedContent = content.length > maxLength ? 
      content.substring(0, maxLength) + '...' : content;

    const prompt = `Generate a concise, descriptive title (3-8 words) for this journal entry. The title should capture the main theme, emotion, or topic. Make it personal and meaningful.

Journal Entry:
"${truncatedContent}"

Title:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates meaningful, concise titles for personal journal entries. Focus on the main emotion, theme, or topic. Keep titles short (3-8 words) and personal.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 20,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const title = data.choices[0]?.message?.content?.trim();

    if (!title) {
      throw new Error('No title generated from OpenAI');
    }

    // Clean up the title
    const cleanTitle = title.replace(/^["']|["']$/g, '').trim();

    return res.status(200).json({ title: cleanTitle });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate title',
      details: error.message 
    });
  }
}