import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http"; // ✅ import HTTP server

declare module "express-session" {
  interface SessionData {
    pendingAuth?: {
      employeeId: string;
      step: number;
    };
    authToken?: string;
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "safe-office-demo-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

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

// ✅ create a real HTTP server here
const httpServer = createServer(app);

(async () => {
  if (app.get("env") === "development") {
    await setupVite(app, httpServer); // ✅ Pass HTTP server, not Express app
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000", 10);
  httpServer.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}jvhg`);
  });
})();
