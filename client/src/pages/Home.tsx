import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import DrinkCard from "@/components/DrinkCard";
import PaymentModal from "@/components/PaymentModal";
import CardPaymentForm from "@/components/CardPaymentForm";
import OTPDisplay from "@/components/OTPDisplay";
import { ProfileDropdown, MenuDropdown } from "@/components/HeaderDropdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import type { Drink, Order } from "@shared/schema";

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showOTP, setShowOTP] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isAuthLoading, toast]);

  // Fetch drinks
  const {
    data: drinks = [],
    isLoading: isDrinksLoading,
    error: drinksError,
  } = useQuery<Drink[]>({
    queryKey: ["/api/drinks"],
    enabled: !!user,
    retry: false,
  });

  // Create order mutation
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
      setCurrentOrder(order);
      setShowPaymentModal(false);
      setShowCardForm(false);
      setShowOTP(true);
      // Refresh user data to update wallet balance
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Payment Successful!",
        description: `Your OTP is ${order.otp}`,
        variant: "default",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }

      let errorMessage = "Payment failed. Please try again.";
      if (error.message.includes("Insufficient")) {
        errorMessage =
          "Insufficient wallet balance. Please use card payment or top up your wallet.";
      }

      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDrinkSelect = (drink: Drink) => {
    setSelectedDrink(drink);
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod: "wallet" | "card") => {
    if (!selectedDrink) return;

    if (paymentMethod === "card") {
      setShowPaymentModal(false);
      setShowCardForm(true);
      return;
    }

    createOrderMutation.mutate({
      drinkId: selectedDrink.id,
      amount: selectedDrink.price,
      paymentMethod,
    });
  };

  const handleCardPaymentComplete = () => {
    if (!selectedDrink) return;

    createOrderMutation.mutate({
      drinkId: selectedDrink.id,
      amount: selectedDrink.price,
      paymentMethod: "card",
    });
  };

  const handleBackToMain = () => {
    setShowOTP(false);
    setShowCardForm(false);
    setShowPaymentModal(false);
    setCurrentOrder(null);
    setSelectedDrink(null);
  };

  const handleBackFromCard = () => {
    setShowCardForm(false);
    setShowPaymentModal(true);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Handle loading and error states
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (drinksError && isUnauthorizedError(drinksError)) {
    return null; // Will redirect to login
  }

  // Show OTP if order is complete
  if (showOTP && currentOrder) {
    return <OTPDisplay order={currentOrder} onBackToMain={handleBackToMain} />;
  }

  // Show card payment form
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <MenuDropdown />
            <h1
              className="text-xl font-semibold"
              data-testid="text-header-title"
            >
              PLACE ORDER
            </h1>
            <ProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        </div>

        {/* User Balance Section */}
        <div className="px-6 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="text-white w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-blue-100 text-sm">BALANCE</p>
              <p className="text-2xl font-bold" data-testid="text-user-balance">
                ₦ {user.walletBalance || "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drinks Grid */}
      <div className="p-6">
        {isDrinksLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                <Skeleton className="w-full h-32 rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : drinksError ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Failed to load drinks</p>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["/api/drinks"] })
              }
              variant="outline"
              data-testid="button-retry-drinks"
            >
              Try Again
            </Button>
          </div>
        ) : drinks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No drinks available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4" data-testid="drinks-grid">
            {drinks.map((drink) => (
              <DrinkCard
                key={drink.id}
                drink={drink}
                onSelect={handleDrinkSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        drink={selectedDrink}
        user={user}
        onPayment={handlePayment}
        isProcessing={createOrderMutation.isPending}
      />
    </div>
  );
}
