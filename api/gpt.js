export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 수면 전문가 AI입니다. 사용자의 수면 습관을 분석하고, 요약과 솔루션을 제공하세요. JSON 형식으로 아래 구조에 맞게 답변하십시오: { "summary": "요약", "issues": ["문제1"], "suggestions": ["해결책1"] }'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7
      })
    });

    const openaiData = await openaiRes.json();
    const replyText = openaiData.choices?.[0]?.message?.content || '';

    let result;
    try {
      result = JSON.parse(replyText);
    } catch (e) {
      console.error("GPT 응답 파싱 실패:", e);
      return res.status(200).json({ reply: replyText });
    }

    res.status(200).json({ result });
  } catch (err) {
    console.error("OpenAI API 요청 실패:", err);
    res.status(500).json({ error: 'OpenAI 요청 실패' });
  }
}
