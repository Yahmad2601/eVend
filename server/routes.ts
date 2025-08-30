import type { Express } from "express";
import { Router } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated } from "./replitAuth";

export function createRouter() {
  const router = Router();

  // Auth routes
  router.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    const replitUser = req.user.claims;
    const username = replitUser.name || replitUser.sub; // Use the correct 'name' field

    let user = await storage.getUser(replitUser.sub);

    if (user) {
      if (
        user.username !== username ||
        user.profileImageUrl !== replitUser.profile_image_url
      ) {
        user = await storage.upsertUser({
          id: replitUser.sub,
          username: username,
          profileImageUrl: replitUser.profile_image_url,
        });
      }
    } else {
      user = await storage.upsertUser({
        id: replitUser.sub,
        username: username,
        profileImageUrl: replitUser.profile_image_url,
        walletBalance: "1000.00",
      });
    }
    res.json(user);
  });

  // Drinks routes
  router.get("/api/drinks", async (req, res) => {
    try {
      const drinks = await storage.getDrinks();
      res.json(drinks);
    } catch (error) {
      console.error("Error fetching drinks:", error);
      res.status(500).json({ message: "Failed to fetch drinks" });
    }
  });

  router.get("/api/drinks/:id", async (req, res) => {
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
  router.post("/api/orders", isAuthenticated, async (req: any, res) => {
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

  router.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  router.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
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

  // const router = createServer(router);
  return router;
}
