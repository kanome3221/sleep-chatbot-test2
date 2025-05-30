export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "API key not found" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "당신은 수면 전문가입니다. 사용자의 수면 습관을 분석해서 JSON 형식의 리포트를 만들어 주세요. 포맷 예시: {summary: 요약, issues: [...], suggestions: [...]}." },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content;

    return res.status(200).json({ result: JSON.parse(reply) });
  } catch (err) {
    console.error("분석 오류:", err);
    return res.status(500).json({ error: "Failed to analyze." });
  }
}
