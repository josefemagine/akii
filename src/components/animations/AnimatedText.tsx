import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  words: string[];
  className?: string;
  interval?: number;
}

const AnimatedText = ({
  words,
  className,
  interval = 3000,
}: AnimatedTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsAnimating(false);
      }, 500); // Fade out duration
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span
      className={cn(
        "transition-opacity duration-500",
        isAnimating ? "opacity-0" : "opacity-100",
        className,
      )}
    >
      {words[currentIndex]}
    </span>
  );
};

export default AnimatedText;
