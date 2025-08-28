import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import DrinkCard from "@/components/DrinkCard";
import PaymentModal from "@/components/PaymentModal";
import PinModal from "@/components/PinModal"; // Import the new PinModal
import CardPaymentForm from "@/components/CardPaymentForm";
import OTPDisplay from "@/components/OTPDisplay";
import { ProfileDropdown, MenuDropdown } from "@/components/HeaderDropdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, RefreshCw } from "lucide-react";
import type { Drink, Order } from "@shared/schema";

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false); // State for the new modal
  const [showCardForm, setShowCardForm] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showOTP, setShowOTP] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [user, isAuthLoading, toast]);

  const {
    data: drinks = [],
    isLoading: isDrinksLoading,
    error: drinksError,
  } = useQuery<Drink[]>({
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
      // Reset all modals and show OTP
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
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
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
    if (!selectedDrink) return;

    setShowPaymentModal(false); // Close payment choice modal

    if (paymentMethod === "card") {
      setShowCardForm(true);
    } else {
      setShowPinModal(true); // Show PIN modal for wallet payments
    }
  };

  // New handler for PIN confirmation
  const handlePinConfirm = (pin: string) => {
    if (!selectedDrink) return;

    // In a real application, you would send the PIN to the backend for verification.
    // For now, we'll assume any 4-digit PIN is correct and proceed.
    console.log("Verifying PIN:", pin); // For demonstration

    createOrderMutation.mutate({
      drinkId: selectedDrink.id,
      amount: selectedDrink.price,
      paymentMethod: "wallet",
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

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
          <p className="text-lg font-semibold text-gray-700">Loading...</p>
        </div>
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
    <div className="min-h-screen bg-background">
      <header className="bg-secondary text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1
              className="text-2xl font-bold tracking-wider"
              data-testid="text-header-title"
            >
              eVend
            </h1>
            <ProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <section className="mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="text-secondary w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Your Balance
                </p>
                <p
                  className="text-2xl font-bold text-gray-800"
                  data-testid="text-user-balance"
                >
                  ₦ {user.walletBalance || "0.00"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="text-primary border-primary hover:bg-primary/10"
            >
              Top up
            </Button>
          </div>
        </section>

        <section>
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
          ) : drinks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No drinks available.</p>
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

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        drink={selectedDrink}
        user={user}
        onPayment={handlePayment}
        isProcessing={createOrderMutation.isPending}
      />

      {/* Add the new PinModal to the render output */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handlePinConfirm}
        isProcessing={createOrderMutation.isPending}
      />
    </div>
  );
}
