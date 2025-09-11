import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { webcrypto } from "node:crypto";
if (!globalThis.crypto?.getRandomValues) {
  // Provide Web Crypto API in older Node versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.crypto = webcrypto as unknown as typeof globalThis.crypto;
}

import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// ✅ just register routes
registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});

let prepared = false;

export async function prepare() {
  if (prepared) return;
  prepared = true;
  if (app.get("env") === "development") {
    const { createServer } = await import("http");
    const httpServer = createServer(app);
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }
}

export default app;
