/**
 * OCR endpoint — calls Claude API to extract person data from a genealogy image.
 * Falls back gracefully if CLAUDE_API_KEY is not set.
 */
export async function onRequestPost(context) {
  const { request, env } = context

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  try {
    const body = await request.json()
    const { image, mimeType } = body

    if (!image || !mimeType) {
      return new Response(JSON.stringify({ error: 'Missing image or mimeType' }), { status: 400, headers: corsHeaders })
    }

    if (!env.CLAUDE_API_KEY) {
      return new Response(JSON.stringify({ error: 'CLAUDE_API_KEY not configured', person: {}, rawText: '' }), { status: 200, headers: corsHeaders })
    }

    const prompt = `你是一个专业的族谱文字识别助手。
请仔细分析这张图片（可能是老族谱、家谱页面、墓碑、户口本等），提取其中关于人员的信息。

请以JSON格式返回，字段如下（没有的留空字符串）：
{
  "name": "姓名",
  "gender": "male或female",
  "birthYear": "出生年份（4位数字）",
  "birthMonth": "出生月份",
  "birthDay": "出生日",
  "deathYear": "逝世年份（如无则空）",
  "birthPlace": "籍贯/出生地",
  "occupation": "职业",
  "generation": 世代数字,
  "notes": "其他重要信息",
  "rawText": "图片中识别到的所有文字"
}

只返回JSON，不要其他说明。`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      return new Response(JSON.stringify({ error: `Claude API error: ${resp.status}`, person: {}, rawText: '' }), { status: 200, headers: corsHeaders })
    }

    const data = await resp.json()
    const text = data.content?.[0]?.text || '{}'

    let parsed = {}
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
    } catch {
      parsed = { rawText: text }
    }

    const { rawText, ...person } = parsed

    return new Response(JSON.stringify({ person, rawText: rawText || text }), { headers: corsHeaders })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, person: {}, rawText: '' }), { status: 500, headers: corsHeaders })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
