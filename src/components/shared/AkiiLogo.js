import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Circle } from "lucide-react";
const AkiiLogo = ({ className = "", linkClassName = "", textClassName = "", iconClassName = "", showLink = true, }) => {
    const Logo = (_jsxs("div", { className: `flex items-center gap-2 ${className}`, children: [_jsx(Circle, { className: `h-6 w-6 fill-green-500 text-green-500 ${iconClassName}` }), _jsx("span", { className: `text-xl font-semibold font-inter ${textClassName}`, style: { fontSize: "1.296rem" }, children: "Akii" })] }));
    if (showLink) {
        return (_jsx(Link, { to: "/", className: `flex items-center gap-2 ${linkClassName}`, children: Logo }));
    }
    return Logo;
};
export default AkiiLogo;
