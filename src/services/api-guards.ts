import { getAccountIdFromRequest } from "@/lib/apiAuth";
import { auth } from "@/lib/auth";
import { apiForbidden, apiUnauthorized } from "@/services/api-response";

export async function requireAccountId(request: Request) {
  const accountId = await getAccountIdFromRequest(request);
  if (!accountId) {
    return { ok: false as const, response: apiUnauthorized() };
  }

  return { ok: true as const, accountId };
}

export async function requireAdminSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false as const, response: apiUnauthorized() };
  }

  if (session.user.optin !== true) {
    return { ok: false as const, response: apiForbidden() };
  }

  return { ok: true as const, session };
}
