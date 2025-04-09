import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
const AnimatedText = ({ words, className, interval = 3000, }) => {
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
    return (_jsx("span", { className: cn("transition-opacity duration-500", isAnimating ? "opacity-0" : "opacity-100", className), children: words[currentIndex] }));
};
export default AnimatedText;
