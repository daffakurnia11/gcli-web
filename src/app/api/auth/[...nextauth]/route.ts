import { handlers } from "@/lib/auth";
import { apiMethodNotAllowed } from "@/services/api-response";

export const { GET, POST } = handlers;

// AUTO_METHOD_NOT_ALLOWED
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
