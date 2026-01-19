module.exports = async (req, res) => {
  // 1. 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. 获取前端发来的消息
  const { message } = req.body;
  
  // 3. 获取 API Key
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  try {
    // 4. 定义人设 (System Prompt)
    const systemPrompt = `
      Role: You are the AI Portfolio Assistant for Fei Chen, a Digital Architect and UX Designer based in Frisco, TX.
      Tone: Professional, concise, slightly futuristic, and polite.
      Context: User is viewing Fei's portfolio site.
      Fei's Skills: UX/UI, Product Design, 3D Visualization, Python, React.
      Constraint: Only answer questions related to design, tech, or Fei's background. If asked about unrelated topics, politely steer back to the portfolio.
    `;

    // 5. 调用 Google Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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

    // 6. 错误处理
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      throw new Error(data.error.message || 'API Error');
    }

    // 7. 返回结果
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply generated.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
};
