import {
  type User,
  type UpsertUser,
  type Drink,
  type InsertDrink,
  type Order,
  type InsertOrder,
} from "@shared/schema";

// Mock data storage
const mockUsers = new Map<string, User>();
const mockDrinks = new Map<string, Drink>();
const mockOrders = new Map<string, Order>();

// Initialize mock drinks data
const sampleDrinks: Drink[] = [
  {
    id: "drink-1",
    name: "Classic Cola",
    price: "200.00",
    imageUrl: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?w=400&h=600&fit=crop",
    description: "Refreshing classic cola drink",
    inStock: 10,
    createdAt: new Date(),
  },
  {
    id: "drink-2", 
    name: "Orange Fizz",
    price: "180.00",
    imageUrl: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop",
    description: "Zesty orange flavored soda",
    inStock: 8,
    createdAt: new Date(),
  },
  {
    id: "drink-3",
    name: "Lemon Splash", 
    price: "180.00",
    imageUrl: "https://images.unsplash.com/photo-1625772299848-391b8a87eca4?w=400&h=600&fit=crop",
    description: "Crisp lemon-lime refreshment",
    inStock: 12,
    createdAt: new Date(),
  },
  {
    id: "drink-4",
    name: "Power Energy",
    price: "300.00", 
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=600&fit=crop",
    description: "Boost your energy levels",
    inStock: 6,
    createdAt: new Date(),
  },
  {
    id: "drink-5",
    name: "Blue Cola",
    price: "200.00",
    imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=600&fit=crop", 
    description: "Smooth blue cola experience",
    inStock: 9,
    createdAt: new Date(),
  },
  {
    id: "drink-6",
    name: "Golden Malt",
    price: "250.00",
    imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=600&fit=crop",
    description: "Rich malt beverage", 
    inStock: 4,
    createdAt: new Date(),
  },
];

// Initialize sample drinks
sampleDrinks.forEach(drink => mockDrinks.set(drink.id, drink));

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, newBalance: string): Promise<void>;
  
  // Drink operations
  getDrinks(): Promise<Drink[]>;
  getDrink(id: string): Promise<Drink | undefined>;
  createDrink(drink: InsertDrink): Promise<Drink>;
  
  // Order operations
  createOrder(order: InsertOrder & { userId: string; otp: string }): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getUserOrders(userId: string): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: string): Promise<void>;
}

export class MockStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return mockUsers.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id || `user-${Date.now()}`,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      walletBalance: userData.walletBalance || '4180.20',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsers.set(user.id, user);
    return user;
  }

  async updateUserBalance(userId: string, newBalance: string): Promise<void> {
    const user = mockUsers.get(userId);
    if (user) {
      user.walletBalance = newBalance;
      user.updatedAt = new Date();
      mockUsers.set(userId, user);
    }
  }

  // Drink operations
  async getDrinks(): Promise<Drink[]> {
    return Array.from(mockDrinks.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getDrink(id: string): Promise<Drink | undefined> {
    return mockDrinks.get(id);
  }

  async createDrink(drinkData: InsertDrink): Promise<Drink> {
    const drink: Drink = {
      id: `drink-${Date.now()}`,
      name: drinkData.name,
      price: drinkData.price,
      imageUrl: drinkData.imageUrl,
      description: drinkData.description || null,
      inStock: drinkData.inStock || 10,
      createdAt: new Date(),
    };
    mockDrinks.set(drink.id, drink);
    return drink;
  }

  // Order operations
  async createOrder(orderData: InsertOrder & { userId: string; otp: string }): Promise<Order> {
    const order: Order = {
      id: `order-${Date.now()}`,
      userId: orderData.userId,
      drinkId: orderData.drinkId,
      amount: orderData.amount,
      paymentMethod: orderData.paymentMethod,
      otp: orderData.otp,
      status: 'pending',
      createdAt: new Date(),
    };
    mockOrders.set(order.id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return mockOrders.get(id);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return Array.from(mockOrders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const order = mockOrders.get(orderId);
    if (order) {
      order.status = status;
      mockOrders.set(orderId, order);
    }
  }
}

export const storage = new MockStorage();
