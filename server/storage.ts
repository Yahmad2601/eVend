import {
  type User,
  type UpsertUser,
  type Drink,
  type InsertDrink,
  type Order,
  type InsertOrder,
  users as usersTable,
  wallets as walletsTable,
  drinks as drinksTable,
  orders as ordersTable,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// Interface for storage operations - this remains the same
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, newBalance: string): Promise<void>;
  getDrinks(): Promise<Drink[]>;
  getDrink(id: string): Promise<Drink | undefined>;
  createDrink(drink: InsertDrink): Promise<Drink>;
  createOrder(
    order: InsertOrder & { userId: string; otp: string }
  ): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: string): Promise<void>;
  getOrderByOtp(otp: string): Promise<Order | null>;
}

// This new class uses the real database
class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    const user = users[0];
    if (!user) return undefined;

    const wallets = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.userId, id))
      .limit(1);
    const wallet = wallets[0];

    // Combine user data with the wallet balance
    return { ...user, walletBalance: wallet?.balance || "0.00" };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userToInsert = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
    };

    // Insert or update the user in the users table
    await db
      .insert(usersTable)
      .values(userToInsert)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      });

    if (!userData.id) throw new Error("userData.id is required");

    // Check if a wallet exists for this user, and create one if it doesn't
    const wallets = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.userId, userData.id))
      .limit(1);
    if (wallets.length === 0) {
      await db
        .insert(walletsTable)
        .values({ id: createId(), userId: userData.id, balance: "0.00" });
    }

    return (await this.getUser(userData.id)) as User;
  }

  async updateUserBalance(userId: string, newBalance: string): Promise<void> {
    await db
      .update(walletsTable)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(walletsTable.userId, userId));
  }

  async getDrinks(): Promise<Drink[]> {
    return await db.select().from(drinksTable);
  }

  async getDrink(id: string): Promise<Drink | undefined> {
    const drinks = await db
      .select()
      .from(drinksTable)
      .where(eq(drinksTable.id, id))
      .limit(1);
    return drinks[0];
  }

  async createDrink(drinkData: InsertDrink): Promise<Drink> {
    const newDrink = { id: createId(), ...drinkData };
    const result = await db.insert(drinksTable).values(newDrink).returning();
    return result[0];
  }

  async createOrder(
    orderData: InsertOrder & { userId: string; otp: string }
  ): Promise<Order> {
    const newOrder = { id: createId(), ...orderData, status: "pending" };
    const result = await db.insert(ordersTable).values(newOrder).returning();
    return result[0];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1);
    return orders[0];
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId));
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, orderId));
  }

  async getOrderByOtp(otp: string): Promise<Order | null> {
    const orders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.otp, otp))
      .limit(1);
    return orders[0] || null;
  }
}

// Export an instance of the new DbStorage class
export const storage = new DbStorage();
