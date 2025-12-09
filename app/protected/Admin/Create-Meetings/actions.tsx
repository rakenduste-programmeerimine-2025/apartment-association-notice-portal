"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function sanitize(input: string) {
  return input.replace(/<[^>]*>/g, "").trim();
}

export async function createMeeting(formData: FormData) {
  try {
    const rawTitle = formData.get("title");
    const rawDescription = formData.get("description");
    const rawDate = formData.get("date");
    const rawTime = formData.get("time");
    const rawDuration = formData.get("duration");


    if (typeof rawTitle !== "string") throw new Error("ERROR_INVALID_TITLE");
    if (typeof rawDescription !== "string" && rawDescription !== null) {
      throw new Error("ERROR_INVALID_DESCRIPTION");
    }
    if (typeof rawDate !== "string") throw new Error("ERROR_MISSING_DATE");
    if (typeof rawTime !== "string") throw new Error("ERROR_MISSING_TIME");
    if (typeof rawDuration !== "string") throw new Error("ERROR_INVALID_DURATION");

    const title = sanitize(rawTitle);
    const description = sanitize(rawDescription ?? "");
    const duration = sanitize(rawDuration);

    if (!title) throw new Error("ERROR_NO_TITLE");
    if (title.length > 120) throw new Error("ERROR_TITLE_TOO_LONG");
    if (description.length > 1200) throw new Error("ERROR_DESCRIPTION_TOO_LONG");

    if (!/^\d{4}-\d{2}-\d{2}/.test(rawDate)) throw new Error("ERROR_INVALID_DATE");
    if (!/^\d{2}:\d{2}$/.test(rawTime)) throw new Error("ERROR_INVALID_TIME");

    const dateTimeString = `${rawDate}T${rawTime}:00`;
    const date = new Date(dateTimeString);

    if (Number.isNaN(date.getTime())) throw new Error("ERROR_INVALID_DATE");
    if (date < new Date()) throw new Error("ERROR_CANNOT_CREATE_MEETING_IN_THE_PAST");

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

    const { error: insertErr } = await supabase.from("meetings").insert({
      title,
      description,
      meeting_date: dateTimeString,
      created_by: auth.user.id,
      duration,
      community_id: profile.community_id,
    });

    if (insertErr) throw new Error("ERROR_DB_INSERT_FAILED");

    revalidatePath("/protected/Admin/Create-Meetings");
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("ERROR_UNKNOWN");
  }
}
