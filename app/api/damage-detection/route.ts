import { NextResponse } from 'next/server';

function requireBaseUrl(envName: string) {
  const value = process.env[envName];
  if (!value || !value.trim()) throw new Error(`Missing ${envName} in environment`);
  return value;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const baseUrl = requireBaseUrl('FASTAPI_MAIN_BASE_URL');
    const endpoint = new URL('/damage-detection/', baseUrl).toString();

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      console.error('Damage detection backend error:', res.status, data);
      return NextResponse.json(
        { error: 'Server is busy, please try again later.' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      pdf_url: data.pdf_url,
      condition_score: data.condition_score,
      ai_detected: data.ai_detected
    });
  } catch (err) {
    console.error('Damage detection error:', err);
    return NextResponse.json(
      { error: 'Server is busy, please try again later.' },
      { status: 500 }
    );
    
  }
}
