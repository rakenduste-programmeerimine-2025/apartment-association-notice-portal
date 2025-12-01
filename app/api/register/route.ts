import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Registration request body:", body);

    const { 
      email, 
      password, 
      fullName, 
      flatNumber, 
      ads_oid, 
      full_address, 
      streetName, 
      houseNumber, 
      city, 
      country 
      country
    } = body;

    if (!email || !password || !fullName || !flatNumber || !ads_oid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let community;
    const { data: existingCommunity, error: communityError } = await supabase
      .from("communities")
      .select("id, ads_oid")
      .eq("ads_oid", ads_oid)
      .single();

    console.log("Existing community lookup:", { existingCommunity, communityError });

    if (communityError && communityError.code !== 'PGRST116') {
      console.error("Community lookup error:", communityError);
      return NextResponse.json({ error: `Error looking up community: ${communityError.message}` }, { status: 500 });
    }

    if (!existingCommunity) {
      console.log("Creating new community for ads_oid:", ads_oid);
      const { data: newCommunity, error: createCommunityError } = await supabase
        .from("communities")
        .insert({
          ads_oid: ads_oid,
          full_address: full_address,
          street_name: streetName,
          house_number: houseNumber,
          city: city,
          country: country,
          created_at: new Date().toISOString(),
        })
        .select("id, ads_oid")
        .single();

      if (createCommunityError) {
        console.error("Community creation error:", createCommunityError);
        return NextResponse.json({ error: `Failed to create community: ${createCommunityError.message}` }, { status: 500 });
      }

      community = newCommunity;
      console.log("New community created:", community);
    } else {
      community = existingCommunity;
      console.log("Using existing community:", community);
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "resident" },
    });

    if (signUpError) {
      console.error("Auth error:", signUpError);
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    const user = signUpData.user;
    if (!user) return NextResponse.json({ error: "User not created" }, { status: 500 });

    console.log("Auth user created:", user.id);

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
      console.error("User insert error:", insertError);
      
      await supabase.auth.admin.deleteUser(user.id);
      
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    console.log("User successfully registered with community_id:", community.id);

    return NextResponse.json({ 
      message: "User registered successfully",
      communityCreated: !existingCommunity,
      communityId: community.id
    }, { status: 200 });
    
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}