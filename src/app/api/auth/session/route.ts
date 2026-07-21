import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

function createSupabaseResponse(request: NextRequest) {
  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  return { response, supabase };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { accessToken?: string; refreshToken?: string };
    const accessToken = body.accessToken?.trim();
    const refreshToken = body.refreshToken?.trim();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Missing session tokens.' }, { status: 400 });
    }

    const { response, supabase } = createSupabaseResponse(request);
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to store session.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { response, supabase } = createSupabaseResponse(request);
    await supabase.auth.signOut();
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to clear session.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}