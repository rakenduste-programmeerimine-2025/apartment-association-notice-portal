"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function sanitize(input: string) {
  return input.replace(/<[^>]*>/g, "").trim();
}

export async function createWorry(formData: FormData) {
  try {
    const rawTitle = formData.get("title");
    const rawContent = formData.get("content");

    if (typeof rawTitle !== "string") throw new Error("ERROR_INVALID_TITLE");
    if (typeof rawContent !== "string" && rawContent !== null) {
      throw new Error("ERROR_INVALID_CONTENT");
    }

    const title = sanitize(rawTitle);
    const content = sanitize(rawContent ?? "");

    if (!title) throw new Error("ERROR_NO_TITLE");
    if (title.length > 120) throw new Error("ERROR_TITLE_TOO_LONG");
    if (content.length > 1200) throw new Error("ERROR_CONTENT_TOO_LONG");

    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) throw new Error("ERROR_UNAUTHORIZED");

    const { data: profile, error: profileErr } = await supabase
      .from("users")
      .select("community_id")
      .eq("id", auth.user.id)
      .single();

    if (profileErr) throw new Error("ERROR_FETCHING_PROFILE");
    if (!profile?.community_id) throw new Error("ERROR_USER_HAS_NO_COMMUNITY");

    const { error: insertErr } = await supabase.from("worries").insert({
      title,
      content,
      created_by: auth.user.id,
      community_id: profile.community_id
    });

    if (insertErr) throw new Error("ERROR_DB_INSERT_FAILED");

    revalidatePath("/protected/Resident/Create-Worry");
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("ERROR_UNKNOWN");
  }
}
