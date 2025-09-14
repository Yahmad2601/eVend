import type { Express } from "express";
import { storage } from "./storage.js";
import { insertOrderSchema } from "../shared/schema.js";
import { z } from "zod";
import { SignJWT, jwtVerify } from "jose";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || "safe-office-demo-secret"
);

// --- 2. Define your app's details for WebAuthn ---
// This MUST match your deployed URL for production
const rpID =
  process.env.NODE_ENV === "production" ? "e-vend.vercel.app" : "localhost";
const origin =
  process.env.NODE_ENV === "production"
    ? `https://${rpID}`
    : `http://${rpID}:3000`;
const rpName = "eVend";

const requireAuth = async (req: any, res: any, next: any) => {
  const token = req.headers.cookie
    ?.split(";")
    .map((c: string) => c.trim())
    .find((c: string) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    req.user = { claims: payload };
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const getCookie = (req: any, name: string) =>
  req.headers.cookie
    ?.split(";")
    .map((c: string) => c.trim())
    .find((c: string) => c.startsWith(`${name}=`))
    ?.split("=")[1];

export function registerRoutes(app: Express): void {
  // Login route that accepts credentials and issues a JWT
  app.post("/api/login", async (req: any, res) => {
    try {
      const loginSchema = z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      });

      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const { username } = result.data;

      const claims = {
        sub: username,
        email: `${username}@abuzaria.edu`,
        first_name: username,
        last_name: "(Student)",
        profile_image_url: null,
      };

      const token = await new SignJWT(claims)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h")
        .sign(jwtSecret);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.json({ message: "Logged in" });
    } catch (error) {
      console.error("Error issuing token:", error);
      res.status(500).json({ message: "Failed to set up auth" });
    }
  });

  // Logout route clears the token cookie
  app.get("/api/logout", (_req: any, res) => {
    res.clearCookie("token");
    res.redirect("/");
  });

  // Auth routes
  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);

      // Create mock user if doesn't exist
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
        });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Drinks routes
  app.get("/api/drinks", async (req, res) => {
    try {
      const drinks = await storage.getDrinks();
      res.json(drinks);
    } catch (error) {
      console.error("Error fetching drinks:", error);
      res.status(500).json({ message: "Failed to fetch drinks" });
    }
  });

  app.get("/api/drinks/:id", async (req, res) => {
    try {
      const drink = await storage.getDrink(req.params.id);
      if (!drink) {
        return res.status(404).json({ message: "Drink not found" });
      }
      res.json(drink);
    } catch (error) {
      console.error("Error fetching drink:", error);
      res.status(500).json({ message: "Failed to fetch drink" });
    }
  });

  // Orders routes
  app.post("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse(req.body);

      // Get user and drink details
      const user = await storage.getUser(userId);
      const drink = await storage.getDrink(orderData.drinkId);

      if (!user || !drink) {
        return res.status(404).json({ message: "User or drink not found" });
      }

      // Check if user has sufficient balance for wallet payment
      if (orderData.paymentMethod === "wallet") {
        const currentBalance = parseFloat(user.walletBalance || "0");
        const orderAmount = parseFloat(orderData.amount);

        if (currentBalance < orderAmount) {
          return res
            .status(400)
            .json({ message: "Insufficient wallet balance" });
        }

        // Deduct amount from wallet
        const newBalance = (currentBalance - orderAmount).toFixed(2);
        await storage.updateUserBalance(userId, newBalance);
      }

      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Create order
      const order = await storage.createOrder({
        drinkId: orderData.drinkId,
        amount: orderData.amount,
        paymentMethod: orderData.paymentMethod,
        userId,
        otp,
      });

      await storage.createTransaction({
        userId,
        type: "debit",
        description: `${drink.name} Purchase`,
        amount: orderData.amount,
      });

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.post("/api/wallet/top-up", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = req.body;

      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount provided." });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const currentBalance = parseFloat(user.walletBalance || "0");
      const newBalance = (currentBalance + amount).toFixed(2);

      await storage.updateUserBalance(userId, newBalance);

      await storage.createTransaction({
        userId,
        type: "credit",
        description: "Wallet Top-up",
        amount: amount.toFixed(2),
      });

      res.status(200).json({ message: "Wallet topped up successfully." });
    } catch (error) {
      console.error("Error topping up wallet:", error);
      res.status(500).json({ message: "Failed to top up wallet." });
    }
  });

  app.get("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if the order belongs to the authenticated user
      const userId = req.user.claims.sub;
      if (order.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/transactions", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // 👇 ADD THIS NEW ENDPOINT FOR THE VENDING MACHINE
  app.post("/api/machine/vend", async (req: any, res) => {
    // 1. Authenticate the Machine
    const apiKey = req.headers.authorization?.split(" ")[1];
    if (apiKey !== process.env.VENDING_MACHINE_API_KEY) {
      return res.status(401).json({ message: "Unauthorized machine" });
    }

    // 2. Validate the OTP from the request
    const { otp } = req.body;
    if (!otp || typeof otp !== "string" || otp.length !== 4) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    try {
      // 3. Find the order with the given OTP
      const order = await storage.getOrderByOtp(otp);

      // Check if order exists, is not already used, and is not expired
      if (!order) {
        return res.status(404).json({ message: "OTP not found" });
      }
      if (order.status === "completed") {
        return res.status(409).json({ message: "OTP has already been used" });
      }

      // Optional: Check if the OTP is expired (e.g., older than 5 minutes)
      const fiveMinutes = 5 * 60 * 1000;
      if (
        order.createdAt &&
        new Date().getTime() - order.createdAt.getTime() > fiveMinutes
      ) {
        await storage.updateOrderStatus(order.id, "expired");
        return res.status(410).json({ message: "OTP has expired" });
      }

      // 4. Mark the order as completed to prevent reuse
      await storage.updateOrderStatus(order.id, "completed");

      // 5. Respond with the drink details for dispensing
      const drink = await storage.getDrink(order.drinkId);
      res.status(200).json({
        success: true,
        drinkId: order.drinkId,
        drinkName: drink?.name || "Unknown Drink",
      });
    } catch (error) {
      console.error("Vending error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- Fingerprint / WebAuthn Routes ---

  app.get(
    "/api/webauthn/register-options",
    requireAuth,
    async (req: any, res) => {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) return res.status(404).json({ message: "User not found" });

      const userAuthenticators = await storage.getAuthenticatorsByUserId(
        user.id
      );

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID: new TextEncoder().encode(user.id), // Uint8Array
        userName: user.email || user.id,
        excludeCredentials: userAuthenticators.map((auth: any) => ({
          id: auth.credentialID,
          ...(Array.isArray(auth.transports)
            ? { transports: auth.transports }
            : {}),
        })),
      });

      req.session.challenge = options.challenge;
      res.cookie("challenge", options.challenge, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 5 * 60 * 1000,
      });
      req.session.save(() => res.json(options));
    }
  );

  // --- WebAuthn Registration Response ---
  app.post("/api/webauthn/register", requireAuth, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (!user) return res.status(404).json({ message: "User not found" });

      let verification: VerifiedRegistrationResponse;
      try {
        verification = await verifyRegistrationResponse({
          response: req.body,
          expectedChallenge: req.session.challenge || getCookie(req, "challenge"),
          expectedOrigin: origin,
          expectedRPID: rpID,
        });
      } catch (error) {
      console.error(error);
      return res.status(400).json({ error: (error as Error).message });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo;
      // Save passkey in DB as per official docs
      await storage.saveAuthenticator({
        userId: user.id,
        credentialID: credential.id, // base64url string
        credentialPublicKey: isoBase64URL.fromBuffer(
          Buffer.from(credential.publicKey)
        ),
        counter: credential.counter,
        transports: credential.transports,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
      });
    }

    res.json({ verified });
  });

  // --- WebAuthn Authentication Options ---
  app.get("/api/webauthn/auth-options", requireAuth, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userAuthenticators = await storage.getAuthenticatorsByUserId(user.id);

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userAuthenticators.map((auth: any) => ({
        id: auth.credentialID, // base64url string
        ...(Array.isArray(auth.transports)
          ? { transports: auth.transports }
          : {}),
      })),
    });

    req.session.challenge = options.challenge;
    res.cookie("challenge", options.challenge, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 1000,
    });
    req.session.save(() => res.json(options));
  });

  // --- WebAuthn Authentication Response ---
  app.post("/api/webauthn/auth", requireAuth, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userAuthenticators = await storage.getAuthenticatorsByUserId(user.id);
    const passkey = userAuthenticators.find(
      (auth: any) => auth.credentialID === req.body.id
    );

    if (!passkey)
      return res.status(404).json({ message: "Authenticator not found" });

      let verification: VerifiedAuthenticationResponse;
      try {
        verification = await verifyAuthenticationResponse({
          response: req.body,
          expectedChallenge: req.session.challenge || getCookie(req, "challenge"),
          expectedOrigin: origin,
          expectedRPID: rpID,
          credential: {
            id:
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: (error as Error).message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified && authenticationInfo) {
      await storage.updateAuthenticatorCounter(
        passkey.credentialID,
        authenticationInfo.newCounter
      );
    }

    res.json({ verified });
  });
}
