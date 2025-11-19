"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function sanitize(input: string) {
  return input.replace(/<[^>]*>/g, "").trim();
}

export async function createNotice(formData: FormData) {
  try {
    const rawTitle = formData.get("title");
    const rawContent = formData.get("content");
    const rawCategory = formData.get("category");

    if (typeof rawTitle !== "string") throw new Error("ERROR_INVALID_TITLE");
    if (typeof rawContent !== "string") throw new Error("ERROR_INVALID_CONTENT");
    if (typeof rawCategory !== "string") throw new Error("ERROR_INVALID_CATEGORY");

    const title = sanitize(rawTitle);
    const content = sanitize(rawContent);
    const category = sanitize(rawCategory);

    if (!title) throw new Error("ERROR_NO_TITLE");
    if (!content) throw new Error("ERROR_NO_CONTENT");

    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) throw new Error("ERROR_UNAUTHORIZED");

    const { data: profile, error: profileErr } = await supabase
  .from("users")
  .select("id, role, community_id")
  .eq("id", auth.user.id)
  .single();


if (profileErr) throw new Error("ERROR_FETCHING_PROFILE");
    if (!profile?.community_id) throw new Error("ERROR_NO_COMMUNITY");
    if (!profile?.role || profile.role !== "admin") throw new Error("ERROR_FORBIDDEN");

    const { error: insertErr } = await supabase.from("notices").insert({
      title,
      content,
      category,
      created_by: auth.user.id,
      community_id: profile.community_id,
    });

    if (insertErr) throw new Error("ERROR_INSERT_FAILED");

    revalidatePath("/protected/Admin/Notices");
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("ERROR_UNKNOWN");
  }
}
