import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import PaymentRecapPage from "./_components/PaymentRecapPage";

export default async function AdminPaymentPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (session.user.optin !== true) {
    redirect("/dashboard");
  }

  return <PaymentRecapPage />;
}
