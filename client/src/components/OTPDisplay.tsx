import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Camera, Download, RefreshCw } from "lucide-react"; // 1. Import RefreshCw for loading
import html2canvas from "html2canvas";
import type { Order } from "@shared/schema";

interface OTPDisplayProps {
  order: Order | null;
  onBackToMain: () => void;
  isLoading?: boolean; // 2. Add isLoading prop to handle loading state
}

export default function OTPDisplay({
  order,
  onBackToMain,
  isLoading,
}: OTPDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const otpCardRef = useRef<HTMLDivElement>(null);

  // 3. Safely get OTP digits only if an order exists
  const otpDigits = order ? order.otp.split("") : [];

  const handleCopy = () => {
    // Guard clause to prevent copying a null order
    if (!order) return;

    navigator.clipboard.writeText(order.otp).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: `OTP ${order.otp} is now in your clipboard.`,
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleScreenshot = () => {
    // Guard clause for both the element and the order
    if (!otpCardRef.current || !order) return;
    setIsSaving(true);

    html2canvas(otpCardRef.current, {
      backgroundColor: null,
      scale: 2,
    })
      .then((canvas) => {
        const link = document.createElement("a");
        link.download = `eVend-OTP-${order.otp}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setIsSaving(false);
        toast({
          title: "Image Saved!",
          description: "The OTP has been saved to your downloads.",
        });
      })
      .catch((err) => {
        console.error("Oops, something went wrong!", err);
        setIsSaving(false);
        toast({
          title: "Error",
          description: "Could not save the image. Please try again.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 evend-pattern text-white text-center">
      <div
        ref={otpCardRef}
        className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl w-full max-w-sm"
      >
        <h2
          className="text-2xl font-bold mb-4"
          data-testid="text-payment-success"
        >
          {/* 4. Show a loading state for the title */}
          {isLoading ? "Processing Payment..." : "Payment Successful!"}
        </h2>

        <p className="text-white/80 mb-2">
          {isLoading ? "Please wait a moment" : "Your One-Time Password is"}
        </p>

        {/* 5. Conditionally render either a spinner or the OTP digits */}
        <div className="flex items-center justify-center space-x-3 mb-6 min-h-[80px]">
          {isLoading || !order ? (
            <RefreshCw className="w-12 h-12 animate-spin text-secondary" />
          ) : (
            <>
              <div className="flex space-x-3" data-testid="otp-display">
                {otpDigits.map((digit, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-secondary text-4xl font-bold shadow-lg"
                    data-testid={`otp-digit-${index}`}
                  >
                    {digit}
                  </div>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isCopied ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </button>
            </>
          )}
        </div>

        {!isLoading && (
          <p className="text-sm text-white/80 mb-8">
            Enter this code on the vending machine.
          </p>
        )}
      </div>

      <div className="w-full max-w-sm mt-4 space-y-3">
        <Button
          onClick={handleScreenshot}
          // 6. Disable buttons during loading to prevent errors
          disabled={isSaving || isLoading || !order}
          className="bg-white/20 w-full h-12 rounded-lg font-semibold hover:bg-white/30 transition-colors text-base backdrop-blur-sm"
        >
          {isSaving ? (
            <Download className="w-5 h-5 mr-2 animate-bounce" />
          ) : (
            <Camera className="w-5 h-5 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save as Image"}
        </Button>

        <Button
          onClick={onBackToMain}
          className="bg-white text-secondary w-full h-12 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-base"
          data-testid="button-order-another"
          disabled={isLoading}
        >
          Order Another Drink
        </Button>
      </div>
    </div>
  );
}
