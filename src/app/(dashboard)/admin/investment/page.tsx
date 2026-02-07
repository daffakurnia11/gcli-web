import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import InvestmentCategoryOverview from "./_components/InvestmentCategoryOverview";

export default async function AdminInvestmentPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (session.user.optin !== true) {
    redirect("/dashboard");
  }

  return <InvestmentCategoryOverview />;
}
