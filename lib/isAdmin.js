import { auth, currentUser } from "@clerk/nextjs/server";

export async function requireAdminOrRedirect() {
  const { userId } = auth();
  if (!userId) return { ok: false, reason: "unauthenticated" };

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  const allow = (process.env.ADMIN_EMAILS || "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (email && allow.includes(email)) return { ok: true, email };
  return { ok: false, reason: "forbidden" };
}