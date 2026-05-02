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

    let data: Record<string, unknown> = {};
    try {
      const parsed = await res.json();
      data = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
    } catch {
      data = {};
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
      ai_detected: data.ai_detected,
      result_images: data.result_images,
      result_image_urls: data.result_image_urls,
      annotated_images: data.annotated_images,
      annotated_image_urls: data.annotated_image_urls,
      processed_images: data.processed_images,
      processed_image_urls: data.processed_image_urls,
      output_images: data.output_images,
      output_image_urls: data.output_image_urls,
      image_results: data.image_results,
      front_result_image_url: data.front_result_image_url,
      back_result_image_url: data.back_result_image_url,
      front_annotated_image_url: data.front_annotated_image_url,
      back_annotated_image_url: data.back_annotated_image_url,
    });
  } catch (err) {
    console.error('Damage detection error:', err);
    return NextResponse.json(
      { error: 'Server is busy, please try again later.' },
      { status: 500 }
    );
    
  }
}
