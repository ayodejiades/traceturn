"use server";

import { revalidatePath } from "next/cache";
import { createRecord } from "@/db";

export async function submitRecord(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "title is required" };
  await createRecord(title);
  revalidatePath("/");
  return { ok: true };
}
