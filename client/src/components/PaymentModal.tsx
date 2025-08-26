import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, X } from "lucide-react";
import type { Drink, User } from "@shared/schema";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  drink: Drink | null;
  user: User | null;
  onPayment: (paymentMethod: 'wallet' | 'card') => void;
  isProcessing: boolean;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  drink, 
  user, 
  onPayment,
  isProcessing 
}: PaymentModalProps) {
  if (!drink) return null;

  const drinkPrice = parseFloat(drink.price);
  const userBalance = parseFloat(user?.walletBalance || '0');
  const hasSufficientBalance = userBalance >= drinkPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm mx-auto" data-testid="modal-payment">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-gray-800">
            Complete Payment
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Choose your payment method to complete your order
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600" data-testid="text-selected-drink">
              Selected: <span className="font-medium">{drink.name}</span>
            </p>
            <p className="text-2xl font-bold text-primary mt-2" data-testid="text-payment-amount">
              ₦ {drink.price}
            </p>
            {user && (
              <p className="text-sm text-gray-500 mt-1" data-testid="text-wallet-balance">
                Wallet Balance: ₦ {user.walletBalance}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => onPayment('wallet')}
              disabled={!hasSufficientBalance || isProcessing}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              data-testid="button-pay-wallet"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <Wallet className="mr-2 w-4 h-4" />
                  {hasSufficientBalance ? 'Pay with Wallet' : 'Insufficient Balance'}
                </>
              )}
            </Button>
            
            <Button
              onClick={() => onPayment('card')}
              disabled={isProcessing}
              variant="outline"
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-gray-300 min-h-[48px]"
              data-testid="button-pay-card"
            >
              <CreditCard className="mr-2 w-4 h-4" />
              Pay with Card
            </Button>
            
            <Button
              onClick={onClose}
              disabled={isProcessing}
              variant="ghost"
              className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
              data-testid="button-cancel-payment"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
