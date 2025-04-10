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
import { motion } from "framer-motion";

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
    title: "How Company-Trained AI Transforms Customer Support",
    excerpt:
      "Discover how businesses are achieving 78% higher response accuracy and 42% faster resolution times by training AI on their specific company data.",
    date: "2023-11-15",
    author: "Sarah Johnson",
    category: "AI Training",
    tags: ["Company Data", "Customer Support", "Training"],
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    slug: "how-company-trained-ai-transforms-customer-support",
  },
  {
    id: "2",
    title: "5-Step Process for Training AI on Your Business Data",
    excerpt:
      "A comprehensive guide to preparing, structuring, and implementing your company's unique data for AI training to achieve optimal performance.",
    date: "2023-10-28",
    author: "Michael Chen",
    category: "Implementation",
    tags: ["Data Preparation", "Implementation", "Best Practices"],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    slug: "5-step-process-for-training-ai-on-business-data",
  },
  {
    id: "3",
    title: "Measuring ROI from Company-Specific AI Implementation",
    excerpt:
      "Learn how to track and measure the business impact of deploying AI trained on your company data, with real metrics from successful implementations.",
    date: "2023-10-10",
    author: "Jessica Miller",
    category: "Business",
    tags: ["ROI", "Analytics", "Business Impact"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    slug: "measuring-roi-from-company-specific-ai-implementation",
  },
  {
    id: "4",
    title: "Privacy and Security in Company Data AI Training",
    excerpt:
      "Best practices for maintaining data privacy, security, and compliance while training AI systems on sensitive company information and customer data.",
    date: "2023-09-22",
    author: "David Wilson",
    category: "Security",
    tags: ["Privacy", "Data Security", "Compliance"],
    image:
      "https://images.unsplash.com/photo-1563237023-b1e970526dcb?w=800&q=80",
    slug: "privacy-security-company-data-ai-training",
  },
  {
    id: "5",
    title: "Case Study: How TechGear Trained AI on 500+ Product Specifications",
    excerpt:
      "An in-depth look at how TechGear Manufacturing trained their AI to handle complex technical support questions using their extensive product database.",
    date: "2023-09-05",
    author: "Amanda Rodriguez",
    category: "Case Study",
    tags: ["Product Data", "Technical Support", "Manufacturing"],
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80",
    slug: "case-study-techgear-ai-training-product-specifications",
  },
  {
    id: "6",
    title: "Training E-commerce AI on Your Product Catalog and Customer Behavior",
    excerpt:
      "Strategies for e-commerce businesses to train AI on their specific product catalogs, pricing strategies, and customer behavior patterns for higher conversions.",
    date: "2023-08-18",
    author: "Ryan Thompson",
    category: "E-commerce",
    tags: ["Product Catalog", "Customer Behavior", "E-commerce"],
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    slug: "training-ecommerce-ai-product-catalog-customer-behavior",
  },
];

const BlogHeader = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
            Insights & Resources
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            AI Training & Implementation <span className="text-primary">Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-[800px]">
            Expert guidance on training AI with your company data, implementation strategies, 
            and measurable results from businesses using personalized AI assistants.
          </p>
          <div className="w-full max-w-md flex items-center relative mt-4">
            <Input
              type="search"
              placeholder="Search articles about AI training..."
              className="pr-10 h-12 rounded-full border-primary/20 focus:border-primary"
            />
            <Search className="absolute right-3 h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Button variant="outline" size="sm" className="rounded-full">
              Company Data Training
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              Implementation Guides
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              Case Studies
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              ROI Analysis
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"></div>
    </section>
  );
};

const FeaturedPost = () => {
  const featuredPost = blogPosts[0];

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tighter">
            Featured Article
          </h2>
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link to="/blog">
              View all articles <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <Card className="overflow-hidden border-none shadow-md bg-card">
          <div className="grid md:grid-cols-5 md:min-h-[400px]">
            <div className="md:col-span-3 lg:col-span-2 order-2 md:order-1">
              <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {featuredPost.category}
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-lg">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center pt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredPost.date}
                    </div>
                    <div className="mx-2 h-1 w-1 rounded-full bg-muted-foreground"></div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    {featuredPost.tags.map((tag) => (
                      <div
                        key={tag}
                        className="inline-flex items-center text-xs bg-muted px-2.5 py-0.5 rounded-full"
                      >
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-fit mt-6 gap-2" 
                  asChild
                >
                  <Link to={`/blog/${featuredPost.slug}`}>
                    Read full article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </div>
            
            <div 
              className="md:col-span-2 lg:col-span-3 order-1 md:order-2 relative h-64 md:h-auto"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${featuredPost.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 mix-blend-multiply"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

const BlogPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative">
        <div
          className="h-52 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
        </div>
        <div className="absolute top-4 left-4">
          <div className="inline-flex items-center rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-xs text-white font-medium">
            {post.category}
          </div>
        </div>
      </div>
      
      <CardContent className="flex-1 p-6">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {post.date}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {post.author}
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-3 line-clamp-2 hover:text-primary transition-colors">
          <Link to={`/blog/${post.slug}`} className="hover:no-underline">
            {post.title}
          </Link>
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0, 2).map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center text-xs bg-muted px-2 py-0.5 rounded-full"
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </div>
          ))}
          {post.tags.length > 2 && (
            <div className="inline-flex items-center text-xs text-muted-foreground">
              +{post.tags.length - 2} more
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0">
        <Button variant="outline" size="sm" className="w-full gap-1 hover:bg-primary hover:text-white transition-colors" asChild>
          <Link to={`/blog/${post.slug}`}>
            Read article <ArrowRight className="h-3.5 w-3.5" />
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
    <section className="py-16 md:py-20 bg-muted/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary mb-3">
              Latest Insights
            </div>
            <h2 className="text-3xl font-bold tracking-tighter">
              Recently Published Articles
            </h2>
          </div>
          <p className="text-muted-foreground mt-2 md:mt-0 max-w-md">
            Expert guides on training AI with your specific company data and measuring business impact
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <BlogPostCard post={post} />
            </motion.div>
          ))}
        </div>
        
        <div className="flex items-center justify-center mt-16">
          <div className="inline-flex items-center rounded-xl bg-background border shadow-sm p-1">
            <Button variant="ghost" size="icon" className="rounded-lg">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button variant="default" size="sm" className="h-9 w-9 rounded-lg">
              1
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 rounded-lg">
              2
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 rounded-lg">
              3
            </Button>
            <Button variant="ghost" size="icon" className="rounded-lg">
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
    { name: "All Topics", isActive: true },
    { name: "AI Training", isActive: false },
    { name: "Data Preparation", isActive: false },
    { name: "Implementation", isActive: false },
    { name: "ROI & Analytics", isActive: false },
    { name: "Privacy & Security", isActive: false },
    { name: "Case Studies", isActive: false },
    { name: "E-commerce", isActive: false },
  ];

  return (
    <section className="py-14 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">
            Browse by Training Category
          </h2>
          <p className="text-muted-foreground mb-8">
            Explore our comprehensive library of company data AI training and implementation articles
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Button
                variant={category.isActive ? "default" : "outline"}
                className={`w-full h-auto py-3 px-4 justify-start ${
                  category.isActive ? "border-primary/20 shadow-sm" : "hover:bg-muted/50"
                }`}
              >
                {category.name}
                {category.isActive && (
                  <span className="ml-auto bg-primary/20 text-primary text-xs py-0.5 px-2 rounded-full">
                    Featured
                  </span>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card border rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-xl font-bold mb-3">Recent Topics</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm">
                <span>Training on product specifications</span>
                <span className="text-xs text-muted-foreground">12 articles</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span>GDPR compliance in AI training</span>
                <span className="text-xs text-muted-foreground">8 articles</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span>Measuring conversion improvements</span>
                <span className="text-xs text-muted-foreground">9 articles</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card border rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-xl font-bold mb-3">Popular Case Studies</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm">
                <span>TechGear's 42% support cost reduction</span>
                <span className="text-xs text-primary">Case Study</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span>Global Commerce's 27-country deployment</span>
                <span className="text-xs text-primary">Case Study</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span>MedSupply's training on 10,000 products</span>
                <span className="text-xs text-primary">Case Study</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Newsletter = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.6))]"></div>
          <div className="relative p-6 md:p-12 lg:p-16">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-4">
                  Get Our Company AI Training Insights
                </h2>
                <p className="text-primary-foreground/90 md:text-xl mb-8 max-w-2xl mx-auto">
                  Subscribe for exclusive guides, case studies, and best practices on training AI with your specific business data.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col sm:flex-row max-w-lg mx-auto gap-3"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 bg-white/10 text-white placeholder:text-white/60 border-white"
                />
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Subscribe
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-white/70"
              >
                <p>Join 12,000+ AI implementation experts and business leaders</p>
                <p className="mt-1">We'll send one valuable email per week. No spam.</p>
              </motion.div>
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
