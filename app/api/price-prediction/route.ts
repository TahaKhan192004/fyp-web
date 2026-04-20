import { NextResponse } from 'next/server';

function requireBaseUrl(envName: string) {
  const value = process.env[envName];
  if (!value || !value.trim()) throw new Error(`Missing ${envName} in environment`);
  return value;
}

export async function POST(req: Request) {
  try {
    const body = await req.formData(); // receive as FormData from frontend

    const fd = new FormData();

    // Map all fields to FastAPI
    for (const [key, value] of body.entries()) {
      fd.append(key, String(value));
    }

    const baseUrl = requireBaseUrl('FASTAPI_MAIN_BASE_URL');
    const endpoint = new URL('/price-prediction/', baseUrl).toString();

    const res = await fetch(endpoint, {
      method: 'POST',
      body: fd
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.detail ?? data?.error ?? 'Price prediction failed' },
        { status: res.status }
      );
    }

    return NextResponse.json(data ?? {});
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Price prediction failed' },
      { status: 500 }
    );
  }
}
