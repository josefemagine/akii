import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layout/MainLayout";
import {
  Search,
  Calendar,
  User,
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  slug: string;
}

// Sample blog posts data (in a real app, this would come from an API)
const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "How AI Chat Agents Are Revolutionizing Customer Support",
    excerpt:
      "Discover how businesses are using AI chat agents to provide 24/7 support, reduce costs, and improve customer satisfaction.",
    date: "2023-06-15",
    author: "Sarah Johnson",
    category: "Customer Support",
    tags: ["AI", "Customer Support", "Automation"],
    image:
      "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&q=80",
    slug: "how-ai-chat-agents-revolutionizing-customer-support",
  },
  {
    id: "2",
    title: "5 Ways to Train Your AI Agent for Better Performance",
    excerpt:
      "Learn the best practices for training your AI chat agent to provide more accurate and helpful responses to your customers.",
    date: "2023-05-28",
    author: "Michael Chen",
    category: "AI Training",
    tags: ["AI Training", "Best Practices", "Performance"],
    image:
      "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&q=80",
    slug: "5-ways-train-ai-agent-better-performance",
  },
  {
    id: "3",
    title: "Integrating AI Agents with WhatsApp: A Complete Guide",
    excerpt:
      "A step-by-step guide to integrating your AI chat agent with WhatsApp to reach customers on their preferred messaging platform.",
    date: "2023-05-10",
    author: "Jessica Miller",
    category: "Integration",
    tags: ["WhatsApp", "Integration", "Messaging"],
    image:
      "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80",
    slug: "integrating-ai-agents-whatsapp-complete-guide",
  },
  {
    id: "4",
    title: "The ROI of AI Chat Agents: Real Business Results",
    excerpt:
      "Explore real-world case studies and data showing the return on investment businesses are seeing from implementing AI chat agents.",
    date: "2023-04-22",
    author: "David Wilson",
    category: "Business",
    tags: ["ROI", "Case Studies", "Business Results"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    slug: "roi-ai-chat-agents-real-business-results",
  },
  {
    id: "5",
    title: "AI Agents vs. Human Support: Finding the Right Balance",
    excerpt:
      "Learn how to effectively combine AI chat agents with human support teams to provide the best customer experience.",
    date: "2023-04-05",
    author: "Amanda Rodriguez",
    category: "Strategy",
    tags: ["Human Support", "Customer Experience", "Strategy"],
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80",
    slug: "ai-agents-vs-human-support-right-balance",
  },
  {
    id: "6",
    title: "Customizing Your Shopify Chat Agent for Higher Conversions",
    excerpt:
      "Discover specific strategies for optimizing your Shopify AI chat agent to increase sales and improve customer engagement.",
    date: "2023-03-18",
    author: "Ryan Thompson",
    category: "E-commerce",
    tags: ["Shopify", "Conversions", "E-commerce"],
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
    slug: "customizing-shopify-chat-agent-higher-conversions",
  },
];

const BlogHeader = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Akii Blog
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Insights, guides, and news about AI chat agents and customer
            engagement strategies.
          </p>
          <div className="w-full max-w-md flex items-center relative">
            <Input
              type="search"
              placeholder="Search articles..."
              className="pr-10"
            />
            <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturedPost = () => {
  const featuredPost = blogPosts[0];

  return (
    <section className="py-8 md:py-12">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">
          Featured Post
        </h2>
        <Card className="overflow-hidden">
          <div className="md:grid md:grid-cols-2">
            <div
              className="h-60 md:h-auto bg-cover bg-center"
              style={{ backgroundImage: `url(${featuredPost.image})` }}
            ></div>
            <CardContent className="p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {featuredPost.date}
                    <span className="mx-2">•</span>
                    <User className="mr-1 h-3 w-3" />
                    {featuredPost.author}
                  </div>
                  <h3 className="text-2xl font-bold">{featuredPost.title}</h3>
                  <p className="text-muted-foreground">
                    {featuredPost.excerpt}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {featuredPost.tags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded-md"
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="link"
                className="p-0 h-auto mt-4 flex items-center"
                asChild
              >
                <Link to={`/blog/${featuredPost.slug}`}>
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
};

const BlogPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <Card className="flex flex-col h-full">
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${post.image})` }}
      ></div>
      <CardContent className="flex-1 p-6">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Calendar className="mr-1 h-3 w-3" />
          {post.date}
          <span className="mx-2">•</span>
          <User className="mr-1 h-3 w-3" />
          {post.author}
        </div>
        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-4">{post.excerpt}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded-md"
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Button variant="link" className="p-0 h-auto" asChild>
          <Link to={`/blog/${post.slug}`}>
            Read more <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const RecentPosts = () => {
  // Skip the first post as it's used as the featured post
  const recentPosts = blogPosts.slice(1);

  return (
    <section className="py-8 md:py-12">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">
          Recent Posts
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
        <div className="flex items-center justify-center mt-12">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              1
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              2
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              3
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Categories = () => {
  const categories = [
    "All",
    "Customer Support",
    "AI Training",
    "Integration",
    "Business",
    "Strategy",
    "E-commerce",
  ];

  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="container px-4 md:px-6">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

const Newsletter = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="rounded-lg bg-primary text-primary-foreground p-6 md:p-10">
          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-primary-foreground/90 md:text-lg">
                Get the latest insights, tips, and news about AI chat agents
                delivered directly to your inbox.
              </p>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-primary-foreground text-primary"
                />
                <Button variant="secondary">Subscribe</Button>
              </div>
              <p className="text-xs text-primary-foreground/70">
                By subscribing, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Blog = () => {
  return (
    <MainLayout>
      <BlogHeader />
      <FeaturedPost />
      <Categories />
      <RecentPosts />
      <Newsletter />
    </MainLayout>
  );
};

export default Blog;
