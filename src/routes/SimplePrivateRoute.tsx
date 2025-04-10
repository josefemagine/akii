import React from "react";

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import DashboardLayout from "@/components/dashboard/DashboardLayout.tsx";
import { LoadingScreen } from "@/components/LoadingScreen.tsx";
interface PrivateRouteProps {}

const PrivateRoute = ({ children }>: void => {
    const { user, isLoading } = useAuth(>;
    if (isLoading> {
        return <LoadingScreen, { message: "Loading..." }>;
    }
    if (!user> {
        return <Navigate, { to: "/", replace: true }>;
    }
    return <DashboardLayout, { children: children || <Outlet, {}> }>;
};
export default PrivateRoute;
