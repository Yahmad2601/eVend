import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const totalSlides = 3;

  const slides = [
    {
      icon: <Coffee className="w-16 h-16 text-white" />,
      title:
        "Input the OTP given to you on the eVending machine and receive your drink",
      dots: [true, false, false],
    },
    {
      icon: (
        <div className="flex space-x-3 justify-center">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className="w-12 h-12 bg-white rounded-lg flex items-center justify-center"
            >
              <span className="text-2xl text-primary">•</span>
            </div>
          ))}
        </div>
      ),
      title: "Make Payment and receive your 4 digits OTP",
      dots: [false, true, false],
    },
    {
      icon: (
        <div className="grid grid-cols-4 gap-2 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-12 bg-white bg-opacity-20 rounded"
            ></div>
          ))}
        </div>
      ),
      title: "Select the drink you desire!",
      dots: [false, false, true],
      showButton: true,
    },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && currentSlide < totalSlides - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (diffX < 0 && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const endX = e.clientX;
    const diffX = startX - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && currentSlide < totalSlides - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (diffX < 0 && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    }
  };

  const handleStart = () => {
    setIsRedirecting(true);
    window.location.href = "/login";
  };

  return (
    <div className="fixed inset-0 z-50 evend-pattern overflow-hidden">
      <motion.div
        ref={sliderRef}
        className="flex h-full cursor-grab active:cursor-grabbing"
        style={{ width: `${totalSlides * 100}%` }}
        animate={{ x: `-${currentSlide * (100 / totalSlides)}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        data-testid="landing-slider"
      >
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            className="w-1/3 flex flex-col items-center justify-center px-8 text-white text-center relative select-none"
            animate={{
              scale: index === currentSlide ? 1 : 0.9,
              opacity: index === currentSlide ? 1 : 0.5,
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-2">
                <span className="text-white">e</span>
                <span className="text-gray-200">v</span>
                <span className="text-gray-300">E</span>
                <span className="text-gray-200">N</span>
                <span className="text-white">D</span>
              </h1>
            </div>

            <div className="mb-8 flex items-center justify-center min-h-[120px]">
              {slide.icon}
            </div>

            <h2 className="text-2xl font-semibold mb-4 leading-tight max-w-xs">
              {slide.title}
            </h2>

            {slide.showButton && (
              <Button
                onClick={handleStart}
                disabled={isRedirecting}
                className="absolute bottom-8 right-8 bg-white text-primary hover:bg-gray-100 rounded-full px-6 py-3 font-semibold shadow-lg"
                data-testid="button-start"
              >
                {isRedirecting ? (
                  "Redirecting..."
                ) : (
                  <>
                    START <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            )}

            <div className="absolute bottom-32">
              <div className="flex space-x-2">
                {slide.dots.map((active, dotIndex) => (
                  <div
                    key={dotIndex}
                    className={`w-3 h-3 rounded-full ${
                      active ? "bg-white" : "bg-white bg-opacity-40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
