import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

console.log('route.ts loaded');

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Params:', params);
  console.log('Request URL:', request.url);

  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
