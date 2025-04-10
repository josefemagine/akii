import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { PlusCircle, Search, Download, BarChart } from "lucide-react";

export default function Affiliates() {
  const [activeTab, setActiveTab] = useState("affiliates");

  // Sample affiliate data
  const affiliates = [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      referrals: 24,
      earnings: "$1,240.00",
      status: "active",
      joinDate: "2023-10-15",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      referrals: 18,
      earnings: "$920.00",
      status: "active",
      joinDate: "2023-11-02",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael@example.com",
      referrals: 7,
      earnings: "$350.00",
      status: "pending",
      joinDate: "2024-01-20",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily@example.com",
      referrals: 32,
      earnings: "$1,600.00",
      status: "active",
      joinDate: "2023-09-05",
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david@example.com",
      referrals: 0,
      earnings: "$0.00",
      status: "inactive",
      joinDate: "2024-02-10",
    },
  ];

  // Sample payouts data
  const payouts = [
    {
      id: 1,
      affiliate: "John Smith",
      amount: "$450.00",
      date: "2024-03-01",
      status: "completed",
    },
    {
      id: 2,
      affiliate: "Sarah Johnson",
      amount: "$320.00",
      date: "2024-03-01",
      status: "completed",
    },
    {
      id: 3,
      affiliate: "Emily Davis",
      amount: "$600.00",
      date: "2024-03-01",
      status: "completed",
    },
    {
      id: 4,
      affiliate: "John Smith",
      amount: "$400.00",
      date: "2024-02-01",
      status: "completed",
    },
    {
      id: 5,
      affiliate: "Emily Davis",
      amount: "$500.00",
      date: "2024-02-01",
      status: "completed",
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Affiliate Program</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Affiliate
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Affiliates</CardTitle>
              <CardDescription>
                View and manage all your affiliate partners.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search affiliates..." className="pl-8" />
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell className="font-medium">
                          {affiliate.name}
                        </TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>{affiliate.referrals}</TableCell>
                        <TableCell>{affiliate.earnings}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              affiliate.status === "active"
                                ? "default"
                                : affiliate.status === "pending"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {affiliate.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{affiliate.joinDate}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Management</CardTitle>
              <CardDescription>
                Manage affiliate payouts and payment history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search payouts..." className="pl-8" />
                </div>
                <Button>Process New Payouts</Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Affiliate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">
                          {payout.affiliate}
                        </TableCell>
                        <TableCell>{payout.amount}</TableCell>
                        <TableCell>{payout.date}</TableCell>
                        <TableCell>
                          <Badge variant="default">{payout.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reports</CardTitle>
              <CardDescription>
                View detailed analytics about your affiliate program.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Referrals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">81</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$4,110.00</div>
                    <p className="text-xs text-muted-foreground">
                      +8% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Affiliates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                      +1 from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20">
                <div className="text-center">
                  <BarChart className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 font-medium">
                    Referral Performance Chart
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Monthly referral and commission data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Program Settings</CardTitle>
              <CardDescription>
                Configure your affiliate program settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="commission-rate">
                  Default Commission Rate (%)
                </Label>
                <Input id="commission-rate" type="number" defaultValue="5" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-threshold">
                  Minimum Payout Threshold ($)
                </Label>
                <Input id="payout-threshold" type="number" defaultValue="50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookie-days">Cookie Duration (Days)</Label>
                <Input id="cookie-days" type="number" defaultValue="30" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Affiliate Terms & Conditions</Label>
                <textarea
                  id="terms"
                  className="w-full min-h-[150px] p-2 border rounded-md"
                  defaultValue="Standard terms and conditions for the affiliate program..."
                />
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
