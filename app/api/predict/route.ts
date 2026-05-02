import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  // Log what we're actually sending
  console.log('Sending to FastAPI:');
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }

  const res = await fetch(`${process.env.FASTAPI_MAIN_BASE_URL}/price-prediction/`, {
    method: 'POST',
    body: formData,
  });

  const text = await res.text();
  console.log('FastAPI raw response:', res.status, text);

  if (!text) {
    return new Response(JSON.stringify({ error: 'FastAPI returned empty response' }), { status: 500 });
  }

  try {
    const data = JSON.parse(text);
    return new Response(JSON.stringify(data), { status: res.ok ? 200 : res.status });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON from FastAPI', raw: text }), { status: 500 });
  }
}
