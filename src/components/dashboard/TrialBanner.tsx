import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth-compatibility';
import { safeLocalStorage } from '@/lib/browser-check';

interface TrialBannerProps {
  className?: string;
}

// Extended profile type to include subscription fields
interface ExtendedUserProfile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  subscription_status?: string;
  trial_end_date?: string;
}

const TrialBanner: React.FC<TrialBannerProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    // Check if the banner has been dismissed in this session
    const bannerDismissed = safeLocalStorage.getItem('trial-banner-dismissed') === 'true';
    if (bannerDismissed) {
      setIsVisible(false);
      return;
    }

    // Check if the user is on a trial plan and calculate days left
    if (profile) {
      // Cast profile to extended type to access subscription fields
      const extendedProfile = profile as unknown as ExtendedUserProfile;
      const hasPaidPlan = extendedProfile.subscription_status === 'active' || 
                          extendedProfile.subscription_status === 'paid';
      
      if (!hasPaidPlan && extendedProfile.trial_end_date) {
        const trialEnd = new Date(extendedProfile.trial_end_date);
        const today = new Date();
        const diffTime = trialEnd.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        setTrialDaysLeft(diffDays > 0 ? diffDays : 0);
        setIsVisible(!hasPaidPlan);
      } else {
        setIsVisible(false);
      }
    }
  }, [profile]);

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

  return (
    <div 
      className={`bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between ${className}`}
    >
      <div className="flex items-center">
        <Clock className="h-5 w-5 mr-2 flex-shrink-0" />
        <span>
          Your trial ends in <strong>{trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'}</strong>. 
          Upgrade to a paid plan to keep using all features.
        </span>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <Button 
          variant="outline" 
          size="sm"
          className="text-amber-800 border-amber-300 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-700 dark:hover:bg-amber-800/50"
          onClick={dismissBanner}
        >
          Dismiss
        </Button>
        <Button 
          variant="default" 
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white border-none"
          onClick={goToBilling}
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );
};

export default TrialBanner;
