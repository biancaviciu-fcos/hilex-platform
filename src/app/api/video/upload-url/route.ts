import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "owner"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (process.env.VIDEO_PROVIDER !== "cloudflare_stream") {
    return NextResponse.json(
      { error: "Only Cloudflare Stream upload URLs are scaffolded here." },
      { status: 400 }
    );
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_TOKEN;

  if (!accountId || !token) {
    return NextResponse.json({ error: "Cloudflare is not configured." }, { status: 500 });
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        maxDurationSeconds: 7200,
        requireSignedURLs: false
      })
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: "Could not create upload URL", details: payload }, { status: 500 });
  }

  return NextResponse.json({
    uploadUrl: payload.result.uploadURL,
    videoId: payload.result.uid
  });
}
