import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Drinks routes
  app.get('/api/drinks', async (req, res) => {
    try {
      const drinks = await storage.getDrinks();
      res.json(drinks);
    } catch (error) {
      console.error("Error fetching drinks:", error);
      res.status(500).json({ message: "Failed to fetch drinks" });
    }
  });

  app.get('/api/drinks/:id', async (req, res) => {
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
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
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
      if (orderData.paymentMethod === 'wallet') {
        const currentBalance = parseFloat(user.walletBalance || '0');
        const orderAmount = parseFloat(orderData.amount);
        
        if (currentBalance < orderAmount) {
          return res.status(400).json({ message: "Insufficient wallet balance" });
        }
        
        // Deduct amount from wallet
        const newBalance = (currentBalance - orderAmount).toFixed(2);
        await storage.updateUserBalance(userId, newBalance);
      }

      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Create order
      const order = await storage.createOrder({
        ...orderData,
        userId,
        otp,
      });

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
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

  // Seed drinks data (development only)
  app.post('/api/seed-drinks', async (req, res) => {
    try {
      const seedDrinks = [
        {
          name: "Classic Cola",
          price: "200.00",
          imageUrl: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?w=400&h=600&fit=crop",
          description: "Refreshing classic cola drink",
        },
        {
          name: "Orange Fizz",
          price: "180.00",
          imageUrl: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop",
          description: "Zesty orange flavored soda",
        },
        {
          name: "Lemon Splash",
          price: "180.00",
          imageUrl: "https://images.unsplash.com/photo-1625772299848-391b8a87eca4?w=400&h=600&fit=crop",
          description: "Crisp lemon-lime refreshment",
        },
        {
          name: "Power Energy",
          price: "300.00",
          imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
          description: "Boost your energy levels",
        },
        {
          name: "Blue Cola",
          price: "200.00",
          imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=600&fit=crop",
          description: "Smooth blue cola experience",
        },
        {
          name: "Golden Malt",
          price: "250.00",
          imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=600&fit=crop",
          description: "Rich malt beverage",
        },
      ];

      for (const drinkData of seedDrinks) {
        await storage.createDrink(drinkData);
      }

      res.json({ message: "Drinks seeded successfully" });
    } catch (error) {
      console.error("Error seeding drinks:", error);
      res.status(500).json({ message: "Failed to seed drinks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
