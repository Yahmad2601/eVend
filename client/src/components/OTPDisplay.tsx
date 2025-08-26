import { Button } from "@/components/ui/button";
import type { Order } from "@shared/schema";

interface OTPDisplayProps {
  order: Order;
  onBackToMain: () => void;
}

export default function OTPDisplay({ order, onBackToMain }: OTPDisplayProps) {
  const otpDigits = order.otp.split('');

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary via-secondary to-gray-700">
      <div className="flex flex-col items-center justify-center h-full px-8 text-white text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-white">e</span>
            <span className="text-gray-200">v</span>
            <span className="text-gray-300">E</span>
            <span className="text-gray-200">N</span>
            <span className="text-white">D</span>
          </h1>
        </div>

        <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm max-w-sm w-full">
          <h2 className="text-2xl font-semibold mb-4" data-testid="text-payment-success">
            Payment Successful!
          </h2>
          
          <p className="text-blue-100 mb-2">Your OTP is</p>
          
          <div className="flex space-x-3 justify-center mb-6" data-testid="otp-display">
            {otpDigits.map((digit, index) => (
              <div
                key={index}
                className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-primary text-2xl font-bold"
                data-testid={`otp-digit-${index}`}
              >
                {digit}
              </div>
            ))}
          </div>
          
          <p className="text-sm text-blue-100 mb-6">
            Enter this code on the vending machine to get your drink
          </p>
          
          <Button
            onClick={onBackToMain}
            className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            data-testid="button-order-another"
          >
            Order Another Drink
          </Button>
        </div>
      </div>
    </div>
  );
}
