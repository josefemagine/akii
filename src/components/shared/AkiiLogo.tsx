import React from "react";
import { Link } from "react-router-dom";
import { Circle } from "lucide-react";

interface AkiiLogoProps {
  className?: string;
  linkClassName?: string;
  textClassName?: string;
  iconClassName?: string;
  showLink?: boolean;
}

const AkiiLogo: React.FC<AkiiLogoProps> = ({
  className = "",
  linkClassName = "",
  textClassName = "",
  iconClassName = "",
  showLink = true,
}) => {
  const Logo = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Circle className={`h-6 w-6 fill-green-500 text-green-500 ${iconClassName}`} />
      <span 
        className={`text-xl font-semibold font-inter ${textClassName}`} 
        style={{ fontSize: "1.296rem" }}
      >
        Akii
      </span>
    </div>
  );

  if (showLink) {
    return (
      <Link to="/" className={`flex items-center gap-2 ${linkClassName}`}>
        {Logo}
      </Link>
    );
  }
  
  return Logo;
};

export default AkiiLogo;
