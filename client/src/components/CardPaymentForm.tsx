import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import type { Drink } from "@shared/schema";
import { useRef } from "react";

interface CardPaymentFormProps {
  drink: Drink;
  onBack: () => void;
  onPaymentComplete: () => void;
  isProcessing: boolean;
}

export default function CardPaymentForm({
  drink,
  onBack,
  onPaymentComplete,
  isProcessing,
}: CardPaymentFormProps) {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const expiryDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const cardholderNameRef = useRef<HTMLInputElement>(null);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
      // 3. Add auto-focus logic
      if (formattedValue.replace(/\s/g, "").length === 16) {
        expiryDateRef.current?.focus();
      }
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value);
      if (formattedValue.length === 5) {
        cvvRef.current?.focus();
      }
    } else if (field === "cvv") {
      formattedValue = value.replace(/[^0-9]/gi, "").substring(0, 3);
      if (formattedValue.length === 3) {
        cardholderNameRef.current?.focus();
      }
    }

    setCardDetails((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const isFormValid = () => {
    return (
      cardDetails.cardNumber.replace(/\s/g, "").length >= 16 &&
      cardDetails.expiryDate.length === 5 &&
      cardDetails.cvv.length >= 3 &&
      cardDetails.cardholderName.trim().length > 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid() && !isProcessing) {
      onPaymentComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-secondary text-white p-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
              data-testid="button-back-payment"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Card Payment</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <div className="max-w-md mx-auto space-y-6 pb-8">
            {/* Order Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="font-medium text-gray-900"
                      data-testid="text-card-drink-name"
                    >
                      {drink.name}
                    </p>
                    <p className="text-sm text-gray-600">33cl Can</p>
                  </div>
                  <p
                    className="text-xl font-bold text-secondary"
                    data-testid="text-card-amount"
                  >
                    ₦ {drink.price}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) =>
                        handleInputChange("cardNumber", e.target.value)
                      }
                      maxLength={19}
                      data-testid="input-card-number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        ref={expiryDateRef}
                        id="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) =>
                          handleInputChange("expiryDate", e.target.value)
                        }
                        maxLength={5}
                        data-testid="input-expiry-date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        ref={cvvRef}
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          handleInputChange("cvv", e.target.value)
                        }
                        maxLength={4}
                        data-testid="input-cvv"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      ref={cardholderNameRef}
                      id="cardholderName"
                      type="text"
                      placeholder="John Doe"
                      value={cardDetails.cardholderName}
                      onChange={(e) =>
                        handleInputChange("cardholderName", e.target.value)
                      }
                      data-testid="input-cardholder-name"
                    />
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <Lock className="w-4 h-4" />
                    <span>
                      Your payment information is secure and encrypted
                    </span>
                  </div>

                  <Button
                    type="submit"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 font-semibold disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                    data-testid="button-complete-payment"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Pay ₦ ${drink.price}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Notice */}
            {/* <div className="text-center text-sm text-gray-500">
              <p>This is a demo payment form.</p>
              <p>No real charges will be made.</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
