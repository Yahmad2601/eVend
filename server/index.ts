import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { registerRoutes } from "./routes.js";
import { webcrypto } from "node:crypto";

// Polyfill for Web Crypto API
if (!globalThis.crypto?.getRandomValues) {
  globalThis.crypto = webcrypto as unknown as typeof globalThis.crypto;
}

declare module "express-session" {
  interface SessionData {
    user?: any;
    challenge?: string;
  }
}

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PgStore = connectPg(session);

app.use(
  session({
    // IMPORTANT: Make sure SESSION_SECRET is set in your Vercel environment variables
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 1000, // 5 minutes
    },
  })
);

// Your existing logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
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
});

// For Vercel, we export the configured Express app.
// Vercel handles creating the server and listening for requests.
export default app;
