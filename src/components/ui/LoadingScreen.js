import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const LoadingScreen = ({ message = "Loading..." }) => {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center h-screen", style: { backgroundColor: '#111927' }, children: [_jsx("div", { className: "w-12 h-12 border-t-4 border-primary rounded-full animate-spin mb-4" }), _jsx("p", { className: "text-foreground text-lg", children: message })] }));
};
export default LoadingScreen;
