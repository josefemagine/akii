import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { PlusCircle, Settings, Trash2 } from "lucide-react";

export default function AdminLandingPages() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Landing Pages</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Landing Page
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Pages</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((page) => (
              <Card key={page}>
                <CardHeader className="pb-2">
                  <CardTitle>Product Launch Page {page}</CardTitle>
                  <CardDescription>Last edited 2 days ago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80`}
                      alt="Landing page preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-primary">67%</span>{" "}
                      conversion rate
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1].map((page) => (
              <Card key={page}>
                <CardHeader className="pb-2">
                  <CardTitle>New Feature Announcement</CardTitle>
                  <CardDescription>Started 5 days ago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80`}
                      alt="Landing page preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-amber-500">Draft</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((page) => (
              <Card key={page} className="opacity-70">
                <CardHeader className="pb-2">
                  <CardTitle>Holiday Campaign {page}</CardTitle>
                  <CardDescription>Archived 30 days ago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=800&q=80`}
                      alt="Landing page preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-gray-500">
                        Archived
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
