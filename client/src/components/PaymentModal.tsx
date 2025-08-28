import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, Loader2 } from "lucide-react";
import type { Drink, User } from "@shared/schema";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  drink: Drink | null;
  user: User | null;
  onPayment: (paymentMethod: "wallet" | "card") => void;
  isProcessing: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  drink,
  user,
  onPayment,
  isProcessing,
}: PaymentModalProps) {
  if (!drink) return null;

  const hasSufficientBalance =
    parseFloat(user?.walletBalance || "0") >= parseFloat(drink.price);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-xs mx-auto p-6"
        data-testid="modal-payment"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-800">
            Confirm Purchase
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-gray-800">{drink.name}</p>
            <p
              className="text-3xl font-bold text-secondary"
              data-testid="text-payment-amount"
            >
              ₦ {drink.price}
            </p>
            <p
              className="text-xs text-gray-500 mt-1"
              data-testid="text-wallet-balance"
            >
              Wallet Balance: ₦ {user?.walletBalance || "0.00"}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => onPayment("wallet")}
              disabled={!hasSufficientBalance || isProcessing}
              className="w-full h-12 text-base font-semibold"
              data-testid="button-pay-wallet"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Wallet className="mr-2 h-5 w-5" />
                  {hasSufficientBalance
                    ? "Pay from Wallet"
                    : "Insufficient Balance"}
                </>
              )}
            </Button>

            <Button
              onClick={() => onPayment("card")}
              disabled={isProcessing}
              variant="outline"
              className="w-full h-12 text-base font-semibold"
              data-testid="button-pay-card"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Pay with Card
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
