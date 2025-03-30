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
  { name: "Mon", conversations: 14, orders: 5, revenue: 420 },
  { name: "Tue", conversations: 22, orders: 8, revenue: 680 },
  { name: "Wed", conversations: 18, orders: 7, revenue: 590 },
  { name: "Thu", conversations: 25, orders: 10, revenue: 850 },
  { name: "Fri", conversations: 20, orders: 9, revenue: 760 },
  { name: "Sat", conversations: 12, orders: 4, revenue: 340 },
  { name: "Sun", conversations: 10, orders: 3, revenue: 250 },
];

const weeklyData = [
  { name: "Week 1", conversations: 95, orders: 32, revenue: 2700 },
  { name: "Week 2", conversations: 105, orders: 38, revenue: 3200 },
  { name: "Week 3", conversations: 120, orders: 45, revenue: 3800 },
  { name: "Week 4", conversations: 110, orders: 40, revenue: 3400 },
];

const monthlyData = [
  { name: "Jan", conversations: 380, orders: 140, revenue: 11800 },
  { name: "Feb", conversations: 350, orders: 125, revenue: 10500 },
  { name: "Mar", conversations: 420, orders: 155, revenue: 13100 },
  { name: "Apr", conversations: 450, orders: 170, revenue: 14300 },
  { name: "May", conversations: 480, orders: 185, revenue: 15600 },
  { name: "Jun", conversations: 430, orders: 160, revenue: 13500 },
];

const topProductsData = [
  { product: "Premium T-Shirt", count: 48, revenue: 2400 },
  { product: "Designer Jeans", count: 35, revenue: 3150 },
  { product: "Leather Wallet", count: 29, revenue: 1450 },
  { product: "Wireless Earbuds", count: 24, revenue: 2880 },
  { product: "Fitness Tracker", count: 20, revenue: 2000 },
];

const customerFeedbackData = [
  { name: "Very Satisfied", value: 52 },
  { name: "Satisfied", value: 28 },
  { name: "Neutral", value: 12 },
  { name: "Dissatisfied", value: 6 },
  { name: "Very Dissatisfied", value: 2 },
];

export default function ShopifyAnalytics() {
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
          <CardTitle className="text-xl font-bold">Shopify Analytics</CardTitle>
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
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="feedback">Customer Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Total Conversations
                </div>
                <div className="text-2xl font-bold mt-2">421</div>
                <div className="text-xs text-green-600 mt-1">
                  ↑ 15% from previous period
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </div>
                <div className="text-2xl font-bold mt-2">18.5%</div>
                <div className="text-xs text-green-600 mt-1">
                  ↑ 2.3% from previous period
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  AI-Assisted Revenue
                </div>
                <div className="text-2xl font-bold mt-2">$12,450</div>
                <div className="text-xs text-green-600 mt-1">
                  ↑ 22% from previous period
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">
                Conversations & Orders
              </h3>
              <div className="h-80 flex items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  Chart visualization would appear here
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversations">Conversations</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">
                {chartType === "conversations"
                  ? "Conversations Over Time"
                  : chartType === "orders"
                    ? "Orders Over Time"
                    : "Revenue Over Time"}
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
                  Sales by Product Category
                </h3>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clothing</span>
                    <span className="text-sm font-medium">38%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "38%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Electronics</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "25%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Accessories</span>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "20%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Home & Kitchen</span>
                    <span className="text-sm font-medium">12%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: "12%" }}
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
                <h3 className="text-sm font-medium mb-2">
                  Sales by Time of Day
                </h3>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Morning (6am-12pm)</span>
                    <span className="text-sm font-medium">22%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "22%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Afternoon (12pm-5pm)</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "35%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Evening (5pm-10pm)</span>
                    <span className="text-sm font-medium">38%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "38%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Night (10pm-6am)</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "5%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">Top Selling Products</h3>
              <div className="space-y-4">
                {topProductsData.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.product}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-purple-600 h-2.5 rounded-full"
                          style={{
                            width: `${(item.count / topProductsData[0].count) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-sm font-medium">
                      {item.count} sold | ${item.revenue}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">
                AI-Recommended Products
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="text-blue-600 text-lg font-bold">42%</div>
                  <div className="text-sm text-blue-800">Purchase Rate</div>
                </div>
                <div className="rounded-md bg-green-50 p-4">
                  <div className="text-green-600 text-lg font-bold">$58</div>
                  <div className="text-sm text-green-800">Avg. Order Value</div>
                </div>
                <div className="rounded-md bg-amber-50 p-4">
                  <div className="text-amber-600 text-lg font-bold">3.2</div>
                  <div className="text-sm text-amber-800">Items Per Order</div>
                </div>
                <div className="rounded-md bg-purple-50 p-4">
                  <div className="text-purple-600 text-lg font-bold">68%</div>
                  <div className="text-sm text-purple-800">Relevance Score</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium mb-4">
                  Customer Satisfaction
                </h3>
                <div className="space-y-2">
                  {customerFeedbackData.map((item, index) => (
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
                    style={{ width: `${customerFeedbackData[0].value}%` }}
                  ></div>
                  <div
                    className="bg-green-300 h-4"
                    style={{ width: `${customerFeedbackData[1].value}%` }}
                  ></div>
                  <div
                    className="bg-gray-300 h-4"
                    style={{ width: `${customerFeedbackData[2].value}%` }}
                  ></div>
                  <div
                    className="bg-red-300 h-4"
                    style={{ width: `${customerFeedbackData[3].value}%` }}
                  ></div>
                  <div
                    className="bg-red-500 h-4"
                    style={{ width: `${customerFeedbackData[4].value}%` }}
                  ></div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="text-sm font-medium mb-4">AI Assistance Rate</h3>
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
                    75% of customer inquiries were successfully handled by the
                    AI without human intervention
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-4">Customer Comments</h3>
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
                        The AI helped me find the perfect size for my jeans!
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
                        Great product recommendations based on my style
                        preferences
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
                        AI couldn't help with my specific shipping question
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
