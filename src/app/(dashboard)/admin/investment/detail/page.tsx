import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import InvestmentCategoryDetailTable from "./_components/InvestmentCategoryDetailTable";

export default async function AdminInvestmentDetailPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (session.user.optin !== true) {
    redirect("/dashboard");
  }

  return <InvestmentCategoryDetailTable />;
}
