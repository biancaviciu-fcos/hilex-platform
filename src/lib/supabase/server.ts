import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const rememberSession = cookieStore.get("hilex_remember")?.value === "1";

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, rememberSession && value ? { ...options, maxAge: 60 * 60 * 24 * 365 } : options);
            } catch {
              // Server Components can read cookies, but cannot always write refreshed auth cookies.
              // Route Handlers and Server Actions still persist them through the same helper.
            }
          });
        }
      }
    }
  );
}
