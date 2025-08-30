import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import DrinkCard from "@/components/DrinkCard";
import PaymentModal from "@/components/PaymentModal";
import PinModal from "@/components/PinModal";
import CardPaymentForm from "@/components/CardPaymentForm"; // Import CardPaymentForm
import OTPDisplay from "@/components/OTPDisplay";
import TransactionHistory, {
  Transaction,
} from "@/components/TransactionHistory";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, PlusCircle, User, RefreshCw } from "lucide-react";
import type { Drink, Order } from "@shared/schema";
import { ProfileDropdown } from "@/components/HeaderDropdown";
import { Link } from "wouter";

// Mock data for transaction history
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "debit",
    description: "Coca-Cola Purchase",
    amount: 150.0,
    date: "29 Aug, 2025",
  },
  {
    id: "2",
    type: "credit",
    description: "Wallet Top-up",
    amount: 1000.0,
    date: "28 Aug, 2025",
  },
  {
    id: "3",
    type: "debit",
    description: "Fanta Purchase",
    amount: 150.0,
    date: "27 Aug, 2025",
  },
];

// 1. Define the props the component will now receive.
interface HomeProps {
  isBalanceVisible: boolean;
  setIsBalanceVisible: (visible: boolean) => void;
}

export default function Home({
  isBalanceVisible,
  setIsBalanceVisible,
}: HomeProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showOTP, setShowOTP] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      window.location.href = "/api/login";
    }
  }, [user, isAuthLoading]);

  const { data: drinks = [], isLoading: isDrinksLoading } = useQuery<Drink[]>({
    queryKey: ["/api/drinks"],
    enabled: !!user,
    retry: false,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      drinkId: string;
      amount: string;
      paymentMethod: "wallet" | "card";
    }) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return await response.json();
    },
    onSuccess: (order: Order) => {
      setShowPinModal(false);
      setCurrentOrder(order);
      setShowOTP(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Payment Successful!",
        description: `Your OTP is ${order.otp}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDrinkSelect = (drink: Drink) => {
    setSelectedDrink(drink);
    setShowPaymentModal(true);
  };

  const handlePayment = (paymentMethod: "wallet" | "card") => {
    setShowPaymentModal(false);
    if (paymentMethod === "wallet") {
      setShowPinModal(true);
    } else {
      setShowCardForm(true);
    }
  };

  const handlePinConfirm = (pin: string) => {
    if (!selectedDrink) return;
    createOrderMutation.mutate({
      drinkId: selectedDrink.id,
      amount: selectedDrink.price,
      paymentMethod: "wallet",
    });
  };

  const handleCardPaymentComplete = () => {
    if (!selectedDrink) return;
    setShowCardForm(false);
    createOrderMutation.mutate({
      drinkId: selectedDrink.id,
      amount: selectedDrink.price,
      paymentMethod: "card",
    });
  };

  const handleBackFromCard = () => {
    setShowCardForm(false);
    setShowPaymentModal(true);
  };

  const handleBackToMain = () => {
    setShowOTP(false);
    setCurrentOrder(null);
    setSelectedDrink(null);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-12 w-12 mx-auto text-primary animate-spin" />
      </div>
    );
  }

  if (showOTP && currentOrder) {
    return <OTPDisplay order={currentOrder} onBackToMain={handleBackToMain} />;
  }

  if (showCardForm && selectedDrink) {
    return (
      <CardPaymentForm
        drink={selectedDrink}
        onBack={handleBackFromCard}
        onPaymentComplete={handleCardPaymentComplete}
        isProcessing={createOrderMutation.isPending}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-secondary text-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="text-secondary" />
              )}
            </div>
            <span className="font-semibold text-lg">
              Hello, {user.username}!
            </span>
          </div>
          <ProfileDropdown user={user} onLogout={handleLogout} />
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-8">
        {/* Updated Balance Card */}
        <div className="bg-secondary text-white rounded-xl p-6 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/20 rounded-full opacity-50"></div>
          <div className="absolute -bottom-8 -left-2 w-40 h-40 bg-primary/20 rounded-full opacity-50"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center text-sm text-white/80">
              <span>Available Balance</span>
              <button
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="flex items-center gap-2"
              >
                {isBalanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-between items-end mt-2">
              <p className="text-4xl font-bold tracking-tight">
                {isBalanceVisible
                  ? `₦${parseFloat(user.walletBalance || "0").toFixed(2)}`
                  : "∗∗∗∗∗∗"}
              </p>
              <Button
                variant="outline"
                className="bg-white/20 text-white hover:bg-white/30 border-white/30 shrink-0"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Top Up
              </Button>
            </div>
            <p className="text-sm text-white/80 mt-4 uppercase tracking-wider">
              TEST NAME: {user.username}
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="text-lg font-bold text-gray-800">
              Recent Transaction
            </h2>
            <Link href="/history">
              <Button asChild variant="link" className="text-sm text-primary">
                <a>View All</a>
              </Button>
            </Link>
          </div>
          <TransactionHistory
            transactions={mockTransactions}
            isBalanceVisible={isBalanceVisible}
          />
        </div>

        {/* Drinks Grid Section */}
        <section id="drinks-section" className="pt-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Select a Drink
          </h2>
          {isDrinksLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-3 shadow-sm border"
                >
                  <Skeleton className="w-full h-28 rounded-lg mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
              data-testid="drinks-grid"
            >
              {drinks.map((drink) => (
                <DrinkCard
                  key={drink.id}
                  drink={drink}
                  onSelect={handleDrinkSelect}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        drink={selectedDrink}
        user={user}
        onPayment={handlePayment}
        isProcessing={createOrderMutation.isPending}
      />
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handlePinConfirm}
        isProcessing={createOrderMutation.isPending}
      />
    </div>
  );
}
