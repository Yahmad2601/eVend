import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Fingerprint, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startAuthentication } from "@simplewebauthn/browser"; // 1. Import WebAuthn function

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  isProcessing: boolean;
}

export default function PinModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}: PinModalProps) {
  const [pin, setPin] = useState("");
  const { toast } = useToast();

  const handleConfirm = () => {
    if (pin.length === 4) {
      onConfirm(pin);
    } else {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN.",
        variant: "destructive",
      });
    }
  };

  const handleFingerprint = async () => {
    try {
      // Get the authentication challenge from your server
      const resp = await fetch("/api/webauthn/auth-options", {
        credentials: "include",
      });
      const options = await resp.json();

      // Prompt the user to scan their fingerprint/face
      const assertion = await startAuthentication(options);

      // Send the result back to your server for verification
      const verificationResp = await fetch("/api/webauthn/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(assertion),
      });

      const verificationJSON = await verificationResp.json();

      // If the server confirms verification, proceed with the payment
      if (verificationJSON && verificationJSON.verified) {
        toast({
          title: "Fingerprint Verified!",
          description: "Confirming payment...",
        });
        // Call onConfirm with a special value to indicate fingerprint success
        onConfirm("-1");
      } else {
        throw new Error(
          verificationJSON.error || "Fingerprint verification failed."
        );
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Verification Failed",
        description:
          "Could not verify fingerprint. Please try again or use your PIN.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xs mx-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-800">
            Enter Your PIN
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Confirm your payment by entering your 4-digit PIN.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-6">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={(value) => setPin(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter className="flex-col space-y-3">
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || pin.length !== 4}
            className="w-full h-12 text-base font-semibold"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirm Payment"
            )}
          </Button>
          <Button
            onClick={handleFingerprint}
            variant="outline"
            className="w-full h-12 text-base font-semibold"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            Use Fingerprint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
