import { supabase } from "../../../lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse JSON from frontend
    const { formData, user_id, pictureUrls } = await req.json();

    if (!pictureUrls || pictureUrls.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // Insert phone data into DB
    const { data, error: dbError } = await supabase
      .from("mobile_phones")
      .insert({
        ...formData,
        user_id,
        pictures: pictureUrls,
      })
      .select()
      .single();

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
       console.log('Inserted phone data:', data);

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
