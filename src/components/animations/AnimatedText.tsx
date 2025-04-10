import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils.ts";

interface AnimatedTextProps {
  words: string[];
  interval?: number;
  className?: string;
}

export function AnimatedText({
  words = ["First", "Second", "Third"],
  interval = 3000,
  className,
}: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsAnimating(false);
      }, 500);
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval, words.length]);

  return (
    <span
      className={cn(
        "transition-opacity duration-500",
        isAnimating ? "opacity-0" : "opacity-100",
        className
      )}
    >
      {words[currentIndex]}
    </span>
  );
}
