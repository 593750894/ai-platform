import { redirect } from "next/navigation";

import { getCurrentUser, getSession, type CurrentUser } from "@/lib/auth/session";

export async function requireUser(redirectTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const params = new URLSearchParams({ next: redirectTo });
    redirect(`/auth/login?${params.toString()}`);
  }
  return user;
}

export async function requireSession(redirectTo: string) {
  const session = await getSession();
  if (!session) {
    const params = new URLSearchParams({ next: redirectTo });
    redirect(`/auth/login?${params.toString()}`);
  }
  return session;
}
