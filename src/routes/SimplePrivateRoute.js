import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LoadingScreen } from "@/components/LoadingScreen";
const PrivateRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return _jsx(LoadingScreen, { message: "Loading..." });
    }
    if (!user) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(DashboardLayout, { children: children || _jsx(Outlet, {}) });
};
export default PrivateRoute;
