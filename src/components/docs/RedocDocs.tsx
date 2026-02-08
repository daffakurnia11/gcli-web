"use client";

import { useEffect } from "react";

import { useOpenApiSpec } from "@/services/hooks/api/useOpenApiSpec";

type RedocDocsProps = {
  specUrl: string;
};

type RedocInit = (
  specOrSpecUrl: string | Record<string, unknown>,
  options?: Record<string, unknown>,
  element?: Element | null,
) => void;

type RedocWindow = Window & {
  Redoc?: {
    init: RedocInit;
  };
};

const REDOC_SCRIPT_ID = "redoc-script";

export function RedocDocs({ specUrl }: RedocDocsProps) {
  const { data: spec } = useOpenApiSpec(specUrl);

  useEffect(() => {
    const mount = document.getElementById("redoc-container");
    if (!mount || !spec) {
      return;
    }

    const render = () => {
      (window as RedocWindow).Redoc?.init(spec, {}, mount);
    };

    const existingScript = document.getElementById(REDOC_SCRIPT_ID);
    if (existingScript) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.id = REDOC_SCRIPT_ID;
    script.src = "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";
    script.async = true;
    script.onload = () => {
      render();
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [spec]);

  return <div id="redoc-container" className="min-h-screen" />;
}
