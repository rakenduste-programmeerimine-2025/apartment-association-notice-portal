import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; 

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const body = await req.json();
    const { email, password, fullName, flatNumber, communityId } = body;

    if (!email || !password || !fullName || !flatNumber || !communityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "resident",
        },
      },
    });

    if (signUpError) {
      console.error("SignUp error:", signUpError);
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    if (!signUpData.user) {
      return NextResponse.json({ error: "User not created" }, { status: 500 });
    }
    const { error: insertError } = await supabase.from("users").insert({
      id: signUpData.user.id,
      email,
      full_name: fullName,
      flat_number: flatNumber,
      community_id: communityId,
      role: "resident",
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "User registered successfully" }, { status: 200 });

  } catch (err) {
    console.error("Unexpected error:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
