export function resolveBackendUrl() {
  const configured = process.env.BACKEND_URL;
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:3001";
  }

  throw new Error("BACKEND_URL is not configured for production environment.");
}
