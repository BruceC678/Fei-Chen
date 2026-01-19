export default async function handler(req, res) {
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
    // 💡 关键修改 1：定义你的“人设”
    // 这段话会让 AI 知道它是谁，并且知道你的背景
    const systemPrompt = `
      Role: You are the AI Portfolio Assistant for Fei Chen, a Digital Architect and UX Designer based in Frisco, TX.
      Tone: Professional, concise, slightly futuristic, and polite.
      Context: User is viewing Fei's portfolio site.
      Fei's Skills: UX/UI, Product Design, 3D Visualization, Python, React.
      Constraint: Only answer questions related to design, tech, or Fei's background. If asked about unrelated topics, politely steer back to the portfolio.
    `;

    // 💡 关键修改 2：确认模型名称
    // 目前 Google 的最新稳定版通常是 gemini-1.5-flash
    // 如果 gemini-2.5 还没公测，用 2.5 可能会报错，建议先用 1.5
    const modelName = 'gemini-1.5-flash'; 

    const response = await fetch(`https://https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
      console.error('Gemini API Error:', data.error); // 在 Vercel 后台看详细错误
      throw new Error(data.error.message);
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
}
