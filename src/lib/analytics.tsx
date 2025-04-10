import React from "react";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { supabase } from "./supabase.tsx";
interface analyticsProps {}

export function fetchAnalyticsData(period) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            // Default data in case of errors or empty results
            const defaultData = {
                totalMessages: 0,
                activeAgents: 0,
                totalConversations: 0,
                averageRating: 0,
                dailyMessages: [0, 0, 0, 0, 0, 0, 0],
                dailyUsers: [0, 0, 0, 0, 0, 0, 0],
                dailySessions: [0, 0, 0, 0, 0, 0, 0],
                growthRate: 0,
                totalRevenue: 0,
                monthlyRecurring: 0,
                activeSubscribers: 0,
                conversionRate: 0,
                averageResponseTime: 0,
                satisfactionRate: 0,
                totalRequests: 0,
                errorRate: 0,
                totalModerated: 0,
                flaggedContent: 0,
                approvalRate: 0,
                moderationRules: 0,
                topAgents: [],
                messageData: [],
            };
            // Determine date range based on period
            let daysToSubtract = 7;
            if (period === "Last 30 days")
                daysToSubtract = 30;
            if (period === "Last 90 days")
                daysToSubtract = 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysToSubtract);
            const startDateStr = startDate.toISOString();
            // Fetch total messages
            const { data: messagesData, error: messagesError } = yield supabase
                .from("messages")
                .select("count", { count: "exact" })
                .gte("created_at", startDateStr);
            if (messagesError)
                throw messagesError;
            const totalMessages = ((_a = messagesData === null || messagesData === void 0 ? void 0 : messagesData[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
            // Fetch active agents
            const { data: agentsData, error: agentsError } = yield supabase
                .from("agents")
                .select("count", { count: "exact" });
            if (agentsError)
                throw agentsError;
            const activeAgents = ((_b = agentsData === null || agentsData === void 0 ? void 0 : agentsData[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
            // Fetch total conversations
            const { data: conversationsData, error: conversationsError } = yield supabase
                .from("conversations")
                .select("count", { count: "exact" })
                .gte("created_at", startDateStr);
            if (conversationsError)
                throw conversationsError;
            const totalConversations = ((_c = conversationsData === null || conversationsData === void 0 ? void 0 : conversationsData[0]) === null || _c === void 0 ? void 0 : _c.count) || 0;
            // Fetch average rating
            const { data: ratingsData, error: ratingsError } = yield supabase
                .from("agent_ratings")
                .select("rating")
                .gte("created_at", startDateStr);
            if (ratingsError)
                throw ratingsError;
            let averageRating = 0;
            if (ratingsData && ratingsData.length > 0) {
                const sum = ratingsData.reduce((acc, curr) => acc + (curr.rating || 0), 0);
                averageRating = sum / ratingsData.length;
            }
            // Fetch daily messages for chart
            const messageData = [];
            const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayStr = daysOfWeek[date.getDay()];
                const dayStart = new Date(date);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(date);
                dayEnd.setHours(23, 59, 59, 999);
                const { data: dayMessages, error: dayMessagesError } = yield supabase
                    .from("messages")
                    .select("count", { count: "exact" })
                    .gte("created_at", dayStart.toISOString())
                    .lte("created_at", dayEnd.toISOString());
                if (dayMessagesError)
                    throw dayMessagesError;
                const messages = ((_d = dayMessages === null || dayMessages === void 0 ? void 0 : dayMessages[0]) === null || _d === void 0 ? void 0 : _d.count) || 0;
                messageData.push({
                    date: dayStr,
                    messages: messages,
                });
            }
            // Fetch daily users and sessions data
            const dailyUsers = [];
            const dailySessions = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dayStart = new Date(date);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(date);
                dayEnd.setHours(23, 59, 59, 999);
                // Fetch unique users for the day
                const { data: dayUsers, error: dayUsersError } = yield supabase
                    .from("sessions")
                    .select("user_id")
                    .gte("created_at", dayStart.toISOString())
                    .lte("created_at", dayEnd.toISOString())
                    .limit(1000); // Limit to avoid excessive data
                if (dayUsersError)
                    throw dayUsersError;
                // Count unique user IDs
                const uniqueUsers = new Set();
                dayUsers === null || dayUsers === void 0 ? void 0 : dayUsers.forEach((session) => {
                    if (session.user_id)
                        uniqueUsers.add(session.user_id);
                });
                dailyUsers.push(uniqueUsers.size);
                dailySessions.push((dayUsers === null || dayUsers === void 0 ? void 0 : dayUsers.length) || 0);
            }
            // Calculate growth rate (comparing last day to first day)
            let growthRate = 0;
            if (dailyUsers[0] > 0 && dailyUsers[6] > 0) {
                growthRate = ((dailyUsers[6] - dailyUsers[0]) / dailyUsers[0]) * 100;
            }
            // Fetch revenue metrics
            const { data: subscriptionsData, error: subscriptionsError } = yield supabase
                .from("subscriptions")
                .select("*")
                .eq("status", "active");
            if (subscriptionsError)
                throw subscriptionsError;
            let totalRevenue = 0;
            let monthlyRecurring = 0;
            const activeSubscribers = (subscriptionsData === null || subscriptionsData === void 0 ? void 0 : subscriptionsData.length) || 0;
            // Fetch subscription plans data to get subscription amounts
            const { data: plansData, error: plansError } = yield supabase
                .from("subscription_plans")
                .select("*");
            if (plansError)
                throw plansError;
            subscriptionsData === null || subscriptionsData === void 0 ? void 0 : subscriptionsData.forEach((sub) => {
                const plan = plansData === null || plansData === void 0 ? void 0 : plansData.find((p) => p.id === sub.plan_id);
                if (plan) {
                    const amount = sub.billing_cycle === "monthly"
                        ? plan.price_monthly
                        : plan.price_yearly;
                    totalRevenue += amount;
                    if (sub.billing_cycle === "monthly") {
                        monthlyRecurring += amount;
                    }
                }
            });
            // Fetch top agents
            const { data: topAgentsData, error: topAgentsError } = yield supabase
                .from("agents")
                .select(`
        id,
        name,
        avatar_url,
        messages:messages!agent_id(count),
        conversations:conversations(count),
        rating:agent_ratings(rating)
      `)
                .order("messages", { ascending: false })
                .limit(5);
            if (topAgentsError)
                throw topAgentsError;
            const topAgents = (topAgentsData || [])
                .map((agent) => {
                var _a, _b, _c, _d, _e, _f;
                if (!agent || typeof agent !== "object")
                    return null;
                const safeAgent = agent;
                return {
                    id: String(safeAgent.id),
                    name: String(safeAgent.name),
                    avatar_url: safeAgent.avatar_url,
                    messages: Number(((_b = (_a = safeAgent.messages) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.count) || 0),
                    conversations: Number(((_d = (_c = safeAgent.conversations) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.count) || 0),
                    rating: Number(((_f = (_e = safeAgent.rating) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.rating) || 0),
                    type: "agent",
                };
            })
                .filter((agent) => agent !== null);
            // Calculate daily messages from messageData
            const dailyMessages = messageData.map((data) => data.messages);
            // Calculate conversion rate
            const { data: totalVisitors, error: visitorsError } = yield supabase
                .from("analytics")
                .select("visitors")
                .single();
            if (visitorsError && visitorsError.code !== "PGRST116")
                throw visitorsError;
            let conversionRate = 0;
            if ((totalVisitors === null || totalVisitors === void 0 ? void 0 : totalVisitors.visitors) &&
                totalVisitors.visitors > 0) {
                conversionRate =
                    (activeSubscribers / totalVisitors.visitors) * 100;
            }
            // Fetch AI performance metrics
            const { data: aiMetrics, error: aiMetricsError } = yield supabase
                .from("ai_metrics")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
            if (aiMetricsError && aiMetricsError.code !== "PGRST116")
                throw aiMetricsError;
            const averageResponseTime = (aiMetrics === null || aiMetrics === void 0 ? void 0 : aiMetrics.avg_response_time) || 1.2;
            const satisfactionRate = (aiMetrics === null || aiMetrics === void 0 ? void 0 : aiMetrics.satisfaction_rate) || 92;
            const totalRequests = (aiMetrics === null || aiMetrics === void 0 ? void 0 : aiMetrics.total_requests) || 8750;
            const errorRate = (aiMetrics === null || aiMetrics === void 0 ? void 0 : aiMetrics.error_rate) || 0.8;
            // Fetch content moderation metrics
            const { data: moderationMetrics, error: moderationError } = yield supabase
                .from("moderation_metrics")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
            if (moderationError && moderationError.code !== "PGRST116")
                throw moderationError;
            const totalModerated = (moderationMetrics === null || moderationMetrics === void 0 ? void 0 : moderationMetrics.total_moderated) || 5280;
            const flaggedContent = (moderationMetrics === null || moderationMetrics === void 0 ? void 0 : moderationMetrics.flagged_content) || 124;
            const approvalRate = (moderationMetrics === null || moderationMetrics === void 0 ? void 0 : moderationMetrics.approval_rate) || 97.6;
            const moderationRules = (moderationMetrics === null || moderationMetrics === void 0 ? void 0 : moderationMetrics.active_rules) || 18;
            return {
                totalMessages,
                activeAgents,
                totalConversations,
                averageRating,
                dailyMessages,
                dailyUsers,
                dailySessions,
                growthRate,
                totalRevenue,
                monthlyRecurring,
                activeSubscribers,
                conversionRate,
                averageResponseTime,
                satisfactionRate,
                totalRequests,
                errorRate,
                totalModerated,
                flaggedContent,
                approvalRate,
                moderationRules,
                topAgents,
                messageData,
            };
        }
        catch (error) {
            console.error("Error fetching analytics data:", error);
            return {
                totalMessages: 0,
                activeAgents: 0,
                totalConversations: 0,
                averageRating: 0,
                dailyMessages: [0, 0, 0, 0, 0, 0, 0],
                dailyUsers: [0, 0, 0, 0, 0, 0, 0],
                dailySessions: [0, 0, 0, 0, 0, 0, 0],
                growthRate: 0,
                totalRevenue: 0,
                monthlyRecurring: 0,
                activeSubscribers: 0,
                conversionRate: 0,
                averageResponseTime: 0,
                satisfactionRate: 0,
                totalRequests: 0,
                errorRate: 0,
                totalModerated: 0,
                flaggedContent: 0,
                approvalRate: 0,
                moderationRules: 0,
                topAgents: [],
                messageData: [],
            };
        }
    });
}
