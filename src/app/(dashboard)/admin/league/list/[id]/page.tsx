import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import LeagueDetailPage from "./_components/LeagueDetailPage";

type PageParams = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminLeagueDetailRoutePage({ params }: PageParams) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (session.user.optin !== true) {
    redirect("/dashboard");
  }

  const { id: rawId } = await params;
  const leagueId = Number.parseInt(decodeURIComponent(rawId), 10);
  if (!Number.isInteger(leagueId) || leagueId < 1) {
    redirect("/admin/league/list");
  }

  return <LeagueDetailPage leagueId={leagueId} />;
}
