module.exports = async (req, res) => {
  // 1. 安全检查
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  try {
    // 定义人设
    const systemPrompt = `
      Role: You are the AI Portfolio Assistant for Fei Chen, a Digital Architect and UX Designer based in Frisco, TX.
      Tone: Professional, concise, slightly futuristic, and polite.
      Context: User is viewing Fei's portfolio site.
      Fei's Skills: UX/UI, Product Design, 3D Visualization, Python, React.
      Constraint: Only answer questions related to design, tech, or Fei's background. If asked about unrelated topics, politely steer back to the portfolio.
    `;

    // 调用 Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { 
            role: "user", 
            parts: [{ text: systemPrompt + "\n\nUser Question: " + message }] 
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API Error:', data.error);
      throw new Error(data.error.message);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply generated.";
    res.status(200).json({ reply });

  } catch (
