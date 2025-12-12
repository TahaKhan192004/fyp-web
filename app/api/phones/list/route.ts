import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("mobile_phones")
    .select("*")
    .order("created_at", { ascending: false });

  return Response.json(data);
}
