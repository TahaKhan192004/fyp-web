import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function requireBaseUrl(envName: string) {
  const value = process.env[envName];
  if (!value || !value.trim()) throw new Error(`Missing ${envName} in environment`);
  return value;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const max_price = searchParams.get('max_price');
    const priority = searchParams.get('priority');

    if (!max_price || !priority) {
      return NextResponse.json(
        { error: 'max_price and priority are required' },
        { status: 400 }
      );
    }

    // Call FastAPI streaming endpoint
    const baseUrl = requireBaseUrl('FASTAPI_RECOMMENDATION_BASE_URL');
    const endpoint = new URL('/recommend-stream/', baseUrl);
    endpoint.searchParams.set('max_price', max_price);
    endpoint.searchParams.set('priority', priority);

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: { Accept: 'text/plain' },
      cache: 'no-store',
    });

    if (!response.ok || !response.body) {
      throw new Error('FastAPI streaming request failed');
    }

    // Pipe the FastAPI stream straight back to the browser
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
