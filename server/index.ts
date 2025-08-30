import express, { type Request, Response, NextFunction } from "express";
import { createRouter } from "./routes";
import { webcrypto } from "node:crypto";
if (!globalThis.crypto?.getRandomValues) {
  // Provide Web Crypto API in older Node versions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globalThis.crypto = webcrypto as unknown as typeof globalThis.crypto;
}

import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http"; // ✅ import HTTP server

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

import { addAuth } from "./replitAuth";
addAuth(app);
app.use(express.json());

// ✅ just register routes

app.use(createRouter());

// app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//   const status = err.status || err.statusCode || 500;
//   const message = err.message || "Internal Server Error";
//   res.status(status).json({ message });
//   throw err;
// });

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
    log(`serving on port ${port}`);
  });
})();
