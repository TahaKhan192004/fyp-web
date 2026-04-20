import { supabase } from "@/app/lib/supabaseClient";
import { NextResponse } from "next/server";

function requireBaseUrl(envName: string) {
  const value = process.env[envName];
  if (!value || !value.trim()) throw new Error(`Missing ${envName} in environment`);
  return value;
}

export async function POST(req: Request) {
  try {
    const { formData, user_id, pictureUrls } = await req.json();

    if (!pictureUrls?.length) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // 1️⃣ Call FastAPI
    const baseUrl = requireBaseUrl("FASTAPI_MAIN_BASE_URL");
    const endpoint = new URL("/damage-detection/", baseUrl).toString();

    const fastapiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_urls: pictureUrls }),
    });

    let fastapiData: any = null;
    try {
      fastapiData = await fastapiRes.json();
    } catch {
      fastapiData = null;
    }

    if (!fastapiRes.ok) {
      console.error("FastAPI damage detection failed:", fastapiRes.status, fastapiData);
      return NextResponse.json(
        { error: "Server is busy, please try again later." },
        { status: 503 }
      );
    }

    const { pdf_url, condition_score } = fastapiData; // ✅ was pdf_path, FastAPI returns pdf_url

    if (!pdf_url) {
      return NextResponse.json({ error: "PDF URL missing" }, { status: 500 });
    }

    console.log(formData.price);

    // 2️⃣ Save DB record
    const { data, error: dbError } = await supabase
      .from("mobile_phones")
      .insert({
        ...formData,
        user_id,
        pictures: pictureUrls,
        condition_score,
        damage_report_pdf: pdf_url,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      pdf_url,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
