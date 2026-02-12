import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import PaymentDetailPage from "./_components/PaymentDetailPage";

type PageParams = {
  params: Promise<{
    invoiceNumber: string;
  }>;
};

export default async function AdminPaymentDetailPage({ params }: PageParams) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth");
  }

  if (session.user.optin !== true) {
    redirect("/dashboard");
  }

  const { invoiceNumber: rawInvoiceNumber } = await params;
  const invoiceNumber = decodeURIComponent(rawInvoiceNumber);

  return <PaymentDetailPage invoiceNumber={invoiceNumber} />;
}
