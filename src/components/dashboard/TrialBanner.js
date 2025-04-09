import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { safeLocalStorage } from '@/lib/browser-check';
const TrialBanner = ({ className }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [trialDaysLeft, setTrialDaysLeft] = useState(null);
    const navigate = useNavigate();
    const { profile, hasProfile } = useAuth();
    useEffect(() => {
        // Check if the banner has been dismissed in this session
        const bannerDismissed = safeLocalStorage.getItem('trial-banner-dismissed') === 'true';
        if (bannerDismissed) {
            setIsVisible(false);
            return;
        }
        // Check if the user is on a trial plan and calculate days left
        if (hasProfile && profile) {
            const hasPaidPlan = profile.subscription_status === 'active' ||
                profile.subscription_status === 'paid';
            // Use type assertion to access potentially non-standard properties
            const extendedProfile = profile;
            const trialEndDate = extendedProfile.trial_end_date || null;
            if (!hasPaidPlan && trialEndDate) {
                const trialEnd = new Date(trialEndDate);
                const today = new Date();
                const diffTime = trialEnd.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setTrialDaysLeft(diffDays > 0 ? diffDays : 0);
                setIsVisible(!hasPaidPlan);
            }
            else {
                setIsVisible(false);
            }
        }
    }, [profile, hasProfile]);
    const dismissBanner = () => {
        setIsVisible(false);
        safeLocalStorage.setItem('trial-banner-dismissed', 'true');
    };
    const goToBilling = () => {
        navigate('/dashboard/billing');
    };
    if (!isVisible || trialDaysLeft === null || trialDaysLeft < 0) {
        return null;
    }
    return (_jsxs("div", { className: `bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between ${className}`, children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Clock, { className: "h-5 w-5 mr-2 flex-shrink-0" }), _jsxs("span", { children: ["Your trial ends in ", _jsxs("strong", { children: [trialDaysLeft, " ", trialDaysLeft === 1 ? 'day' : 'days'] }), ". Upgrade to a paid plan to keep using all features."] })] }), _jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [_jsx(Button, { variant: "outline", size: "sm", className: "text-amber-800 border-amber-300 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-700 dark:hover:bg-amber-800/50", onClick: dismissBanner, children: "Dismiss" }), _jsx(Button, { variant: "default", size: "sm", className: "bg-amber-600 hover:bg-amber-700 text-white border-none", onClick: goToBilling, children: "Upgrade Now" })] })] }));
};
export default TrialBanner;
