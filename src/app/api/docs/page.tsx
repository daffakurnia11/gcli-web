import { RedocDocs } from "@/components/docs/RedocDocs";

export const metadata = {
  title: "API Docs",
  description: "API documentation for GCLI API",
};

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <RedocDocs specUrl="/api/openapi" />
    </main>
  );
}
