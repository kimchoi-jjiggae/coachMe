// Server-side API endpoint for OpenAI title generation
// This keeps your API key secure on the server

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your_openai_api_key_here';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required' });
  }

  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
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
      throw new Error(`OpenAI API error: ${response.status}`);
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
