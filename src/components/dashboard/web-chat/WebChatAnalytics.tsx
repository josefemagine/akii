import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for charts
const dailyData = [
  { name: "Mon", conversations: 12, messages: 65 },
  { name: "Tue", conversations: 19, messages: 87 },
  { name: "Wed", conversations: 15, messages: 72 },
  { name: "Thu", conversations: 21, messages: 103 },
  { name: "Fri", conversations: 18, messages: 92 },
  { name: "Sat", conversations: 9, messages: 43 },
  { name: "Sun", conversations: 7, messages: 38 },
];

const weeklyData = [
  { name: "Week 1", conversations: 82, messages: 410 },
  { name: "Week 2", conversations: 91, messages: 452 },
  { name: "Week 3", conversations: 103, messages: 521 },
  { name: "Week 4", conversations: 89, messages: 438 },
];

const monthlyData = [
  { name: "Jan", conversations: 320, messages: 1650 },
  { name: "Feb", conversations: 290, messages: 1480 },
  { name: "Mar", conversations: 350, messages: 1820 },
  { name: "Apr", conversations: 380, messages: 1950 },
  { name: "May", conversations: 410, messages: 2100 },
  { name: "Jun", conversations: 390, messages: 1980 },
];

const topQuestionsData = [
  { question: "What are your pricing plans?", count: 42 },
  { question: "How do I reset my password?", count: 38 },
  { question: "Do you offer refunds?", count: 31 },
  { question: "How can I contact support?", count: 27 },
  { question: "Is there a free trial?", count: 24 },
];

const satisfactionData = [
  { name: "Very Satisfied", value: 45 },
  { name: "Satisfied", value: 30 },
  { name: "Neutral", value: 15 },
  { name: "Dissatisfied", value: 7 },
  { name: "Very Dissatisfied", value: 3 },
];

export default function WebChatAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [chartType, setChartType] = useState("conversations");

  // Select the appropriate data based on time range
  const getChartData = () => {
    switch (timeRange) {
      case "7d":
        return dailyData;
      case "30d":
        return weeklyData;
      case "90d":
        return monthlyData;
      default:
        return dailyData;
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-bold">
            Web Chat Analytics
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="questions">Top Questions</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Total Conversations
                </div>
                <div className="text-2xl font-bold mt-2">365</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ↑ 12% from previous period
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Avg. Response Time
                </div>
                <div className="text-2xl font-bold mt-2">1.8s</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ↓ 0.3s from previous period
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Satisfaction Rate
                </div>
                <div className="text-2xl font-bold mt-2">92%</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ↑ 3% from previous period
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">
                Conversations & Messages
              </h3>
              <div className="h-80 flex items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  Chart visualization would appear here
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversations">Conversations</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                  <SelectItem value="duration">Avg. Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">
                {chartType === "conversations"
                  ? "Conversations Over Time"
                  : chartType === "messages"
                    ? "Messages Over Time"
                    : "Average Conversation Duration"}
              </h3>
              <div className="h-80 flex items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  Line chart visualization would appear here
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium mb-2">
                  Conversation Sources
                </h3>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Homepage</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                      style={{ width: "42%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Product Pages</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                      style={{ width: "28%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Blog Articles</span>
                    <span className="text-sm font-medium">17%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                      style={{ width: "17%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Support Pages</span>
                    <span className="text-sm font-medium">13%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                      style={{ width: "13%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium mb-2">
                  Conversation Times
                </h3>
                <div className="h-60 flex items-center justify-center">
                  <div className="text-muted-foreground text-sm">
                    Time distribution chart would appear here
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">Top Questions Asked</h3>
              <div className="space-y-4">
                {topQuestionsData.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{item.question}</span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (item.count /
                              topQuestionsData[0].count) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">
                Questions Without Answers
              </h3>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <span className="text-sm">
                    How do I integrate with Salesforce?
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <span className="text-sm">
                    Do you have an affiliate program?
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <span className="text-sm">
                    How long does the setup process take?
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <span className="text-sm">
                    Can I customize the chat for multiple languages?
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="satisfaction" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium mb-4">
                  Satisfaction Ratings
                </h3>
                <div className="h-60 flex items-center justify-center">
                  <div className="text-muted-foreground text-sm">
                    Satisfaction pie chart would appear here
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium mb-4">Rating Breakdown</h3>
                <div className="space-y-2">
                  {satisfactionData.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            index === 0
                              ? "bg-green-500 dark:bg-green-600"
                              : index === 1
                              ? "bg-green-400 dark:bg-green-500"
                              : index === 2
                              ? "bg-yellow-400 dark:bg-yellow-500"
                              : index === 3
                              ? "bg-orange-400 dark:bg-orange-500"
                              : "bg-red-500 dark:bg-red-600"
                          }`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">Recent Feedback</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-200">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium text-sm">Very Satisfied</div>
                    <div className="text-xs text-green-600 dark:text-green-400">2 hours ago</div>
                  </div>
                  <p className="text-sm">
                    The chatbot was incredibly helpful. It answered all my questions quickly and accurately.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium text-sm">Neutral</div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">1 day ago</div>
                  </div>
                  <p className="text-sm">
                    Got most of my questions answered, but had to contact support for a few issues.
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-200">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium text-sm">Satisfied</div>
                    <div className="text-xs text-green-600 dark:text-green-400">2 days ago</div>
                  </div>
                  <p className="text-sm">
                    Good experience overall. The chatbot was friendly and helpful.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
