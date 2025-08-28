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

  const handleFingerprint = () => {
    // In a real app, you would integrate the Web Authentication API (WebAuthn) here.
    // For this demonstration, we'll simulate a successful scan.
    toast({
      title: "Fingerprint Scanned!",
      description: "Confirming payment...",
    });
    // We'll call onConfirm with a dummy PIN to proceed with the mutation.
    onConfirm("-1"); // Use a special value to indicate fingerprint
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
