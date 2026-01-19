export default async function handler(req, res) {
  // 1. 安全检查：只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. 获取前端发来的消息
  const { message, history } = req.body;
  
  // 3. 从环境变量获取 Key (这是安全的，Key 保存在服务器上)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  try {
    // 4. 调用 Google Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          // 这里可以加入历史记录逻辑，目前简化为单次对话
          { parts: [{ text: message }] }
        ]
      })
    });

    const data = await response.json();

    // 5. 检查 Google 返回的数据是否有错
    if (data.error) {
      throw new Error(data.error.message);
    }

    // 6. 把结果提取出来，只发回给前端文字部分
    const reply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch response from Gemini' });
  }
}
