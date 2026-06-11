const GEMINI_API_KEY = 'AIzaSyB3fQA0uaf-Vq7a97sm-q985wfLBiZ6o3E';
async function main() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'models/text-embedding-004', content: { parts: [{ text: 'test' }] } }),
    }
  );
  if (!response.ok) {
     console.error('Failed:', await response.text());
  } else {
     const data = await response.json();
     console.log('Embedding length:', data.embedding.values.length);
  }
}
main();
