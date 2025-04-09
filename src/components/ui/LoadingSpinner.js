import { jsx as _jsx } from "react/jsx-runtime";
/**
 * A simple loading spinner component for inline loading states
 */
const LoadingSpinner = () => {
    return (_jsx("div", { className: "flex items-center justify-center", children: _jsx("div", { className: "w-8 h-8 border-t-2 border-primary rounded-full animate-spin" }) }));
};
export default LoadingSpinner;
