/**
 * Mock API functions for development
 */

export interface AnalyticsData {
  totalMessages: number;
  activeAgents: number;
  totalConversations: number;
  averageRating: number;
  dailyMessages?: number[];
  dailyUsers?: number[];
  dailySessions?: number[];
  growthRate?: number;
  totalRevenue?: number;
  monthlyRecurring?: number;
  activeSubscribers?: number;
  conversionRate?: number;
  averageResponseTime?: number;
  satisfactionRate?: number;
  totalRequests?: number;
  errorRate?: number;
  totalModerated?: number;
  flaggedContent?: number;
  approvalRate?: number;
  moderationRules?: number;
  messageData?: {
    name: string;
    messages: number;
    users: number;
  }[];
  topAgents?: any[];
}

// Allowed periods for analytics data
export enum AnalyticsPeriod {
  LAST_7_DAYS = "Last 7 days",
  LAST_30_DAYS = "Last 30 days",
  LAST_90_DAYS = "Last 90 days",
}

// Safe default data for fallbacks
export const defaultAnalyticsData: AnalyticsData = {
  totalMessages: 0,
  activeAgents: 0,
  totalConversations: 0,
  averageRating: 0,
};

/**
 * Mock function to fetch analytics data - guaranteed to never throw errors
 */
export const fetchAnalyticsData = async (
  period: string = AnalyticsPeriod.LAST_7_DAYS,
): Promise<AnalyticsData> => {
  try {
    // More detailed logging for debugging
    console.log(`API - Fetching analytics data for period: "${period}"`);
    console.time("analytics-data-fetch");
    
    // Minimal delay - just enough to simulate an API call (10ms is sufficient)
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Mock data - simplified for reliability
    const data = {
      totalMessages: 2450,
      activeAgents: 3,
      totalConversations: 134,
      averageRating: 4.7,
      dailyMessages: [120, 145, 132, 165, 178, 156, 149],
      dailyUsers: [24, 28, 25, 32, 35, 30, 27],
      dailySessions: [48, 52, 45, 58, 62, 56, 52],
      growthRate: 9.2,
      totalRevenue: 1250,
      monthlyRecurring: 750,
      activeSubscribers: 43,
      conversionRate: 12.5,
      averageResponseTime: 0.8,
      satisfactionRate: 94,
      totalRequests: 3450,
      errorRate: 1.2,
      totalModerated: 145,
      flaggedContent: 12,
      approvalRate: 98.2,
      moderationRules: 8,
      messageData: Array.from({ length: 7 }, (_, i) => ({
        name: `Day ${i + 1}`,
        messages: Math.floor(Math.random() * 100) + 50,
        users: Math.floor(Math.random() * 30) + 10,
      })),
      topAgents: [
        { id: 1, name: "Customer Support AI", messages: 1245, rating: 4.8 },
        { id: 2, name: "Sales Assistant", messages: 856, rating: 4.6 },
        { id: 3, name: "Technical Support", messages: 512, rating: 4.9 },
      ],
    };

    console.timeEnd("analytics-data-fetch");
    console.log("API - Successfully fetched analytics data:", {
      totalMessages: data.totalMessages,
      totalConversations: data.totalConversations,
      activeAgents: data.activeAgents,
    });
    
    return data;
  } catch (error) {
    console.error("API - Error fetching analytics data:", error);
    // Return safe default data with more meaningful values than zeros
    return { 
      totalMessages: 125,
      activeAgents: 1,
      totalConversations: 24,
      averageRating: 4.2,
    };
  }
};
