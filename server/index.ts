import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { webcrypto } from "node:crypto";

// Provide Web Crypto API in older Node versions if not present
if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto as unknown as typeof globalThis.crypto;
}

// All middleware and route registration remains the same
declare module "express-session" {
  interface SessionData {
    pendingAuth?: {
      employeeId: string;
      step: number;
    };
    authToken?: string;
    user?: any;
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "safe-office-demo-secret", // For production, use an environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // In production, you might set this to true
  })
);

// Your logging middleware (this is fine)
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
      console.log(logLine); // Using console.log for serverless environments
    }
  });

  next();
});

// Register all your API routes
registerRoutes(app);

// Your error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  // It's often better not to re-throw the error in a serverless context
});

// For Vercel, we export the configured Express app.
// Vercel will handle creating the server and listening for requests.
export default app;
