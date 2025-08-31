import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Wallet, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function TopUpPage() {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const topUpMutation = useMutation({
    mutationFn: (topUpAmount: number) =>
      apiRequest("POST", "/api/wallet/top-up", { amount: topUpAmount }),
    onSuccess: async () => {
      toast({
        title: "Success!",
        description: "Your wallet has been topped up.",
      });

      // 👇 THIS IS THE CHANGED LINE
      // Actively refetch the user data and wait for it to finish.
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });

      // Now that the data is fresh, go back to the home page.
      setLocation("/home");
    },
    onError: (error: any) => {
      toast({
        title: "Top-up Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to top up.",
        variant: "destructive",
      });
      return;
    }
    topUpMutation.mutate(numericAmount);
  };

  const handleAmountButtonClick = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="bg-secondary text-white p-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Top Up Wallet</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <div className="max-w-md mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-secondary" />
                  <span>Enter Amount</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTopUp} className="space-y-4">
                  <div>
                    <Label htmlFor="amount" className="sr-only">
                      Amount
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-2xl font-bold text-gray-500">
                        ₦
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-8 h-20 text-4xl font-bold text-center"
                        required
                      />
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000, 3000, 5000, 10000].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        onClick={() => handleAmountButtonClick(value)}
                      >
                        ₦{value}
                      </Button>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={topUpMutation.isPending}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 font-semibold h-12 text-lg"
                  >
                    {topUpMutation.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Top Up"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
