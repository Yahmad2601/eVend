import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Camera, Download } from "lucide-react";
import html2canvas from "html2canvas";
import type { Order } from "@shared/schema";

interface OTPDisplayProps {
  order: Order;
  onBackToMain: () => void;
}

export default function OTPDisplay({ order, onBackToMain }: OTPDisplayProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const otpCardRef = useRef<HTMLDivElement>(null);
  const otpDigits = order.otp.split("");

  const handleCopy = () => {
    navigator.clipboard.writeText(order.otp).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: `OTP ${order.otp} is now in your clipboard.`,
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  const handleScreenshot = () => {
    if (!otpCardRef.current) return;
    setIsSaving(true);

    html2canvas(otpCardRef.current, {
      backgroundColor: null, // Use transparent background
      scale: 2, // Increase resolution
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
        toast({
          title: "Error",
          description: "Could not save the image. Please try again.",
          variant: "destructive",
        });
        setIsSaving(false);
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
          Payment Successful!
        </h2>

        <p className="text-white/80 mb-2">Your One-Time Password is</p>

        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="flex space-x-3" data-testid="otp-display">
            {otpDigits.map((digit, index) => (
              <div
                key={index}
                className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-primary text-4xl font-bold shadow-lg"
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
        </div>

        <p className="text-sm text-white/80 mb-8">
          Enter this code on the vending machine.
        </p>
      </div>

      <div className="w-full max-w-sm mt-4 space-y-3">
        <Button
          onClick={handleScreenshot}
          disabled={isSaving}
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
          className="bg-white text-primary w-full h-12 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-base"
          data-testid="button-order-another"
        >
          Order Another Drink
        </Button>
      </div>
    </div>
  );
}
