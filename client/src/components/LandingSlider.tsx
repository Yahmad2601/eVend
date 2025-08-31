import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShoppingCart,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { motion, PanInfo } from "framer-motion";

export default function LandingSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const totalSlides = 3;
  const slideInterval = 3000; // 3 seconds

  const slides = [
    {
      icon: <ShoppingCart className="w-16 h-16 text-white" />,
      title: "Select your favorite drink from the menu.",
    },
    {
      icon: <CreditCard className="w-16 h-16 text-white" />,
      title: "Pay easily using your wallet or card.",
    },
    {
      icon: <CheckCircle className="w-16 h-16 text-white" />,
      title: "Get an OTP to dispense your drink instantly!",
    },
  ];

  // Effect for auto-sliding
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    }, slideInterval);

    // Clean up the interval on component unmount or when currentSlide changes
    return () => clearInterval(timer);
  }, [currentSlide, totalSlides]);

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  const handleStart = () => {
    setIsRedirecting(true);
    window.location.href = "/login";
  };

  // Handler for manual drag/swipe
  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;

    if (offset.x < -swipeThreshold || velocity.x < -500) {
      // Swiped left
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    } else if (offset.x > swipeThreshold || velocity.x > 500) {
      // Swiped right
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
  };

  return (
    <div className="fixed inset-0 z-50 evend-pattern overflow-hidden flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-2">eVend</h1>
        <p className="text-white/80 text-lg">
          Your quick stop for refreshing drinks.
        </p>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="relative w-full max-w-sm h-64 overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            className="absolute w-full h-full flex flex-col items-center justify-center text-center text-white p-4"
            initial={{ x: "100%", opacity: 0 }}
            animate={{
              x: `${(index - currentSlide) * 100}%`,
              opacity: index === currentSlide ? 1 : 0.5,
              scale: index === currentSlide ? 1 : 0.95,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="mb-4">{slide.icon}</div>
            <h2 className="text-xl font-semibold leading-tight">
              {slide.title}
            </h2>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex space-x-3 my-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index ? "bg-white scale-125" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      <Button
        onClick={handleStart}
        disabled={isRedirecting}
        className="bg-white text-secondary hover:bg-gray-100 h-12 px-8 font-bold shadow-lg text-base"
      >
        {isRedirecting ? "Loading..." : "GET STARTED"}
      </Button>
    </div>
  );
}
