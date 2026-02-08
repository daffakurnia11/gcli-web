import fs from "node:fs";
import path from "node:path";

import type { OpenAPIV3 } from "openapi-types";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const apiRoot = path.join(process.cwd(), "src", "app", "api");
const supportedMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
] as const;

type HttpMethod = (typeof supportedMethods)[number];

const walkRouteFiles = (dir: string, acc: string[] = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkRouteFiles(fullPath, acc);
      continue;
    }

    if (entry.isFile() && entry.name === "route.ts") {
      acc.push(fullPath);
    }
  }

  return acc;
};

const segmentToOpenApi = (segment: string) => {
  if (segment.startsWith("[[...") && segment.endsWith("]]")) {
    const param = segment.slice(5, -2);
    return `{${param}}`;
  }

  if (segment.startsWith("[...") && segment.endsWith("]")) {
    const param = segment.slice(4, -1);
    return `{${param}}`;
  }

  if (segment.startsWith("[") && segment.endsWith("]")) {
    const param = segment.slice(1, -1);
    return `{${param}}`;
  }

  return segment;
};

const routeFileToPath = (routeFile: string) => {
  const relative = path.relative(apiRoot, path.dirname(routeFile));
  if (!relative || relative === ".") {
    return "/api";
  }

  const parts = relative.split(path.sep).map(segmentToOpenApi);
  return `/api/${parts.join("/")}`;
};

const getRouteMethods = (contents: string): HttpMethod[] => {
  const found = new Set<HttpMethod>();

  for (const method of supportedMethods) {
    const functionExportRegex = new RegExp(
      `\\bexport\\s+async\\s+function\\s+${method}\\b|\\bexport\\s+function\\s+${method}\\b`,
      "m",
    );

    const objectExportRegex = new RegExp(
      `\\bexport\\s+const\\s+\\{[^}]*\\b${method}\\b[^}]*\\}\\s*=`,
      "m",
    );

    if (functionExportRegex.test(contents) || objectExportRegex.test(contents)) {
      found.add(method);
    }
  }

  return Array.from(found);
};

const tagFromPath = (apiPath: string) => {
  const section = apiPath.replace(/^\/api\/?/, "").split("/")[0] ?? "General";
  if (!section) {
    return "General";
  }
  return section[0].toUpperCase() + section.slice(1);
};

const buildPathParameters = (apiPath: string): OpenAPIV3.ParameterObject[] => {
  const matches = apiPath.matchAll(/\{([^}]+)\}/g);
  return Array.from(matches).map((match) => ({
    name: match[1],
    in: "path",
    required: true,
    schema: { type: "string" },
    description: `Path parameter: ${match[1]}`,
  }));
};

const createOperation = (
  method: HttpMethod,
  apiPath: string,
): OpenAPIV3.OperationObject => {
  const needsBody = method === "POST" || method === "PUT" || method === "PATCH";
  const pathParameters = buildPathParameters(apiPath);
  const queryParameters: OpenAPIV3.ParameterObject[] = [];
  const primaryTag = tagFromPath(apiPath);
  const isProtected = apiPath.startsWith("/api/user") || apiPath.startsWith("/api/admin");

  if (apiPath === "/api/account/unique-check" && method === "GET") {
    queryParameters.push(
      {
        in: "query",
        name: "type",
        required: true,
        schema: { type: "string", enum: ["username", "email", "discord"] },
      },
      {
        in: "query",
        name: "value",
        required: true,
        schema: { type: "string" },
      },
    );
  }

  if (apiPath === "/api/user/kill-logs" && method === "GET") {
    queryParameters.push(
      {
        in: "query",
        name: "type",
        required: false,
        schema: { type: "string", enum: ["kill", "dead"] },
      },
      {
        in: "query",
        name: "page",
        required: false,
        schema: { type: "integer", minimum: 1 },
      },
      {
        in: "query",
        name: "limit",
        required: false,
        schema: { type: "integer", minimum: 1, maximum: 100 },
      },
    );
  }

  if (apiPath.includes("/investment/detail") && method === "GET") {
    queryParameters.push(
      { in: "query", name: "category", required: false, schema: { type: "string" } },
      { in: "query", name: "gang", required: false, schema: { type: "string" } },
      { in: "query", name: "q", required: false, schema: { type: "string" } },
      { in: "query", name: "page", required: false, schema: { type: "integer", minimum: 1 } },
      { in: "query", name: "limit", required: false, schema: { type: "integer", minimum: 1, maximum: 100 } },
    );
  }

  return {
    tags: [primaryTag],
    summary: `${method} ${apiPath}`,
    operationId: `${method.toLowerCase()}_${apiPath.replace(/[^a-zA-Z0-9]+/g, "_")}`,
    ...(pathParameters.length > 0 || queryParameters.length > 0
      ? { parameters: [...pathParameters, ...queryParameters] }
      : {}),
    ...(needsBody
      ? {
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          },
        }
      : {}),
    ...(isProtected ? { security: [{ bearerAuth: [] }] } : {}),
    responses: {
      "200": {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiSuccessEnvelope",
            },
          },
        },
      },
      "400": {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiErrorEnvelope",
            },
          },
        },
      },
      "401": {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiErrorEnvelope",
            },
          },
        },
      },
      "403": {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiErrorEnvelope",
            },
          },
        },
      },
      "404": {
        description: "Not Found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiErrorEnvelope",
            },
          },
        },
      },
      "500": {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiErrorEnvelope",
            },
          },
        },
      },
      "405": {
        description: "Method Not Allowed",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiErrorEnvelope",
            },
          },
        },
      },
      "429": {
        description: "Too Many Requests",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ApiErrorEnvelope",
            },
          },
        },
      },
    },
  };
};

const buildPaths = (): OpenAPIV3.PathsObject => {
  const paths: OpenAPIV3.PathsObject = {};
  const routeFiles = walkRouteFiles(apiRoot);

  for (const routeFile of routeFiles) {
    const source = fs.readFileSync(routeFile, "utf8");
    const apiPath = routeFileToPath(routeFile);
    const methods = getRouteMethods(source);

    if (methods.length === 0) {
      continue;
    }

    if (!paths[apiPath]) {
      paths[apiPath] = {};
    }

    for (const method of methods) {
      const lower = method.toLowerCase() as Lowercase<HttpMethod>;
      (paths[apiPath] as OpenAPIV3.PathItemObject)[lower] = createOperation(
        method,
        apiPath,
      );
    }
  }

  return paths;
};

let cachedSpec: OpenAPIV3.Document | null = null;

export const getOpenApiSpec = (): OpenAPIV3.Document => {
  if (!cachedSpec) {
    cachedSpec = {
      openapi: "3.0.0",
      info: {
        title: "GCLI Next API",
        version: "1.0.0",
        description:
          "REST API for GCLI dashboard and account management. Responses use a standard envelope.",
      },
      servers: [
        {
          url: appUrl,
          description: "Application server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          ApiMetadata: {
            type: "object",
            required: ["page", "limit", "count", "total"],
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              count: { type: "integer", example: 10 },
              total: { type: "integer", example: 27 },
            },
          },
          ApiSuccessEnvelope: {
            type: "object",
            required: ["success", "code", "message", "data"],
            properties: {
              success: {
                type: "boolean",
                enum: [true],
              },
              code: {
                type: "integer",
                example: 200,
              },
              message: {
                type: "string",
                example: "Successfully fetch data",
              },
              metadata: {
                $ref: "#/components/schemas/ApiMetadata",
              },
              data: {
                nullable: true,
              },
            },
          },
          ApiErrorEnvelope: {
            type: "object",
            required: ["success", "code", "message"],
            properties: {
              success: {
                type: "boolean",
                enum: [false],
              },
              code: {
                type: "integer",
                example: 400,
              },
              message: {
                type: "string",
                example: "Bad Request",
              },
              data: {
                nullable: true,
              },
            },
          },
        },
      },
      paths: buildPaths(),
    };
  }

  return cachedSpec;
};
