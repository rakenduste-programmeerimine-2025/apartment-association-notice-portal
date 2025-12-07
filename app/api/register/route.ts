import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/lib/supabase/client"; // для тестов

function getSupabase() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  } else {
    // 
    return createBrowserClient();
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, flatNumber, ads_oid, full_address, streetName, houseNumber, city, country } = body;

    if (!email || !password || !fullName || !flatNumber || !ads_oid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabase();

    // 
    let community;
    const { data: existingCommunity } = await supabase.from("communities").select("id, ads_oid").eq("ads_oid", ads_oid).single();

    if (!existingCommunity) {
      const { data: newCommunity } = await supabase.from("communities").insert({
        ads_oid,
        full_address,
        street_name: streetName,
        house_number: houseNumber,
        city,
        country,
        created_at: new Date().toISOString(),
      }).select("id, ads_oid").single();

      community = newCommunity ?? null;
    } else {
      community = existingCommunity;
    }

    if (!community || !community.id) {
      return NextResponse.json({ error: "Community not created" }, { status: 500 });
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "resident" },
    });

    if (signUpError) return NextResponse.json({ error: signUpError.message }, { status: 400 });
    const user = signUpData.user;

    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      email,
      full_name: fullName,
      flat_number: flatNumber,
      community_id: community.id,
      role: "resident",
      status: "pending",
    });

    if (insertError) {
      await supabase.auth.admin.deleteUser(user.id);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "User registered successfully",
      communityCreated: !existingCommunity,
      communityId: community.id,
    }, { status: 200 });

  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
