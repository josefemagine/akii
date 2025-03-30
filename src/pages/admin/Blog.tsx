import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  FileText,
  Settings,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { useState } from "react";

// Sample blog post data
const blogPosts = [
  {
    id: "1",
    title: "Getting Started with AI Chat Agents",
    status: "published",
    category: "Tutorials",
    date: "2023-10-15",
    views: 1245,
  },
  {
    id: "2",
    title: "5 Ways to Optimize Your AI Agent for Sales",
    status: "published",
    category: "Sales",
    date: "2023-10-10",
    views: 982,
  },
  {
    id: "3",
    title: "The Future of Customer Support with AI",
    status: "draft",
    category: "Insights",
    date: "2023-10-05",
    views: 0,
  },
  {
    id: "4",
    title: "How to Train Your AI Agent with Custom Data",
    status: "scheduled",
    category: "Tutorials",
    date: "2023-10-20",
    views: 0,
  },
];

// Column definitions for the data table
const columns = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <div className="flex items-center">
          <span
            className={`h-2 w-2 rounded-full mr-2 ${status === "published" ? "bg-green-500" : status === "draft" ? "bg-yellow-500" : "bg-blue-500"}`}
          />
          <span className="capitalize">{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "views",
    header: "Views",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const post = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function AdminBlog() {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="auto-generation">Auto Generation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                Manage your blog posts, edit content, and track performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={blogPosts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage blog categories and tags for better organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Category management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-generation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto Content Generation</CardTitle>
              <CardDescription>
                Configure AI-powered blog post generation settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="industry-news"
                          name="content-source"
                          className="h-4 w-4"
                          defaultChecked
                        />
                        <label htmlFor="industry-news">Industry News</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="seo-topics"
                          name="content-source"
                          className="h-4 w-4"
                        />
                        <label htmlFor="seo-topics">SEO Topics</label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Generation Frequency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="daily"
                          name="frequency"
                          className="h-4 w-4"
                          defaultChecked
                        />
                        <label htmlFor="daily">Daily</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="weekly"
                          name="frequency"
                          className="h-4 w-4"
                        />
                        <label htmlFor="weekly">Weekly</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="monthly"
                          name="frequency"
                          className="h-4 w-4"
                        />
                        <label htmlFor="monthly">Monthly</label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Save Auto-Generation Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blog Settings</CardTitle>
              <CardDescription>
                Configure general blog settings and defaults.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Blog settings interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
