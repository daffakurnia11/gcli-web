import { apiFromLegacy, apiMethodNotAllowed } from "@/services/api-response";
import { getOpenApiSpec } from "@/services/openapi";

export async function GET() {
  return apiFromLegacy(getOpenApiSpec(), { status: 200 });
}

// AUTO_METHOD_NOT_ALLOWED
export function POST() {
  return apiMethodNotAllowed();
}

export function PUT() {
  return apiMethodNotAllowed();
}

export function PATCH() {
  return apiMethodNotAllowed();
}

export function DELETE() {
  return apiMethodNotAllowed();
}

export function OPTIONS() {
  return apiMethodNotAllowed();
}

export function HEAD() {
  return apiMethodNotAllowed();
}
