import {
  type User,
  type UpsertUser,
  type Drink,
  type InsertDrink,
  type Order,
  type InsertOrder,
  type Transaction,
  type InsertTransaction,
  users as usersTable,
  wallets as walletsTable,
  drinks as drinksTable,
  orders as ordersTable,
  transactions as transactionsTable,
  authenticators,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc } from "drizzle-orm";
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
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getAuthenticatorsByUserId(userId: string): Promise<any[]>;
  saveAuthenticator(data: any): Promise<void>;
  updateAuthenticatorCounter(
    authenticatorId: string,
    newCounter: number
  ): Promise<void>;
  getAuthenticatorByCredentialID(credentialID: string): Promise<any>;
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
    if (!userData.id) throw new Error("userData.id is required for upsert");

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

    // if (!userData.id) throw new Error("userData.id is required");

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

  async createTransaction(
    txData: InsertTransaction,
  ): Promise<Transaction> {
    const newTx = { id: createId(), ...txData };
    const result = await db
      .insert(transactionsTable)
      .values(newTx)
      .returning();
    return result[0];
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .orderBy(desc(transactionsTable.createdAt));
  }

  async getAuthenticatorsByUserId(userId: string) {
    return await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.userId, userId));
  }

  async saveAuthenticator(data: any) {
    const newAuthenticator = {
      id: createId(),
      userId: data.userId,
      credentialID: data.credentialID,
      credentialPublicKey: data.credentialPublicKey, // This is now a Buffer from the routes file
      counter: data.counter,
    };
    await db.insert(authenticators).values(newAuthenticator);
  }

  async updateAuthenticatorCounter(
    authenticatorId: string,
    newCounter: number
  ) {
    await db
      .update(authenticators)
      .set({ counter: newCounter })
      .where(eq(authenticators.id, authenticatorId));
  }
  // 👇 3. Add the new function implementation
  async getAuthenticatorByCredentialID(credentialID: string) {
    const result = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.credentialID, credentialID))
      .limit(1);
    return result[0];
  }
}

// Export an instance of the new DbStorage class
export const storage = new DbStorage();
