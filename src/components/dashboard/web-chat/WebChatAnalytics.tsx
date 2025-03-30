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
    <Card className="w-full bg-white shadow-sm">
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
                <div className="text-xs text-green-600 mt-1">
                  ↑ 12% from previous period
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Avg. Response Time
                </div>
                <div className="text-2xl font-bold mt-2">1.8s</div>
                <div className="text-xs text-green-600 mt-1">
                  ↓ 0.3s from previous period
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Satisfaction Rate
                </div>
                <div className="text-2xl font-bold mt-2">92%</div>
                <div className="text-xs text-green-600 mt-1">
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
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "42%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Product Pages</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "28%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pricing Page</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "15%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Blog</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "10%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Other</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "5%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium mb-2">Conversation Times</h3>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Morning (6am-12pm)</span>
                    <span className="text-sm font-medium">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "32%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Afternoon (12pm-5pm)</span>
                    <span className="text-sm font-medium">38%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "38%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Evening (5pm-10pm)</span>
                    <span className="text-sm font-medium">24%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "24%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Night (10pm-6am)</span>
                    <span className="text-sm font-medium">6%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "6%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">Top Questions</h3>
              <div className="space-y-4">
                {topQuestionsData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.question}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-purple-600 h-2.5 rounded-full"
                          style={{
                            width: `${(item.count / topQuestionsData[0].count) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-medium">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">Question Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="text-blue-600 text-lg font-bold">42%</div>
                  <div className="text-sm text-blue-800">Product</div>
                </div>
                <div className="rounded-md bg-green-50 p-4">
                  <div className="text-green-600 text-lg font-bold">27%</div>
                  <div className="text-sm text-green-800">Support</div>
                </div>
                <div className="rounded-md bg-amber-50 p-4">
                  <div className="text-amber-600 text-lg font-bold">18%</div>
                  <div className="text-sm text-amber-800">Pricing</div>
                </div>
                <div className="rounded-md bg-purple-50 p-4">
                  <div className="text-purple-600 text-lg font-bold">13%</div>
                  <div className="text-sm text-purple-800">Other</div>
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
                <div className="space-y-2">
                  {satisfactionData.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full mt-4 overflow-hidden flex">
                  <div
                    className="bg-green-500 h-4"
                    style={{ width: `${satisfactionData[0].value}%` }}
                  ></div>
                  <div
                    className="bg-green-300 h-4"
                    style={{ width: `${satisfactionData[1].value}%` }}
                  ></div>
                  <div
                    className="bg-gray-300 h-4"
                    style={{ width: `${satisfactionData[2].value}%` }}
                  ></div>
                  <div
                    className="bg-red-300 h-4"
                    style={{ width: `${satisfactionData[3].value}%` }}
                  ></div>
                  <div
                    className="bg-red-500 h-4"
                    style={{ width: `${satisfactionData[4].value}%` }}
                  ></div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium mb-4">Resolution Rate</h3>
                <div className="flex items-center justify-center h-40">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32">
                      <circle
                        className="text-gray-200"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className="text-green-500"
                        strokeWidth="10"
                        strokeDasharray="352"
                        strokeDashoffset="88"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                    </svg>
                    <span className="absolute text-2xl text-gray-800 font-bold">
                      75%
                    </span>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    75% of conversations were successfully resolved by the AI
                    without human intervention
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">Feedback Comments</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Very helpful and quick responses
                      </p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        The AI understood my question immediately
                      </p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Couldn't answer my technical question
                      </p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
