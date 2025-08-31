import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";

// Authentication middleware using session
const requireAuth = (req: any, res: any, next: any) => {
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Login route that accepts credentials and creates a mock session
  app.post("/api/login", (req: any, res) => {
    const loginSchema = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    });

    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { username } = result.data;

    req.session.user = {
      claims: {
        sub: username,
        email: `${username}@abuzaria.edu`,
        first_name: username,
        last_name: "(Student)",
        profile_image_url: null,
      },
    };

    res.json({ message: "Logged in" });
  });

  // Logout route clears the session
  app.get("/api/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
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
          walletBalance: "4180.20",
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

  // Mock drinks are already seeded in storage, no need for seed endpoint

  const httpServer = createServer(app);
  return httpServer;
}
