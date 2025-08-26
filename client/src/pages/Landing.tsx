import { useState } from "react";
import LandingSlider from "@/components/LandingSlider";

export default function Landing() {
  const handleStart = () => {
    window.location.href = '/api/login';
  };

  return <LandingSlider onStart={handleStart} />;
}
