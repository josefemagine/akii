import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Code, Database, Lock, Server, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";

const PrivateAIAPI = () => {
  return (
    <MainLayout>
      <div className="bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    Your Company's{" "}
                    <span className="text-primary">Private AI API</span>
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8">
                    Deploy, train, and scale your own private AI instance. Build
                    anything on top of it with our powerful API platform.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="gap-2">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline">
                      View Documentation
                    </Button>
                  </div>
                </motion.div>
              </div>
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-black/5 dark:bg-white/5 rounded-xl p-6 border border-border shadow-lg"
                >
                  <pre className="text-sm overflow-x-auto">
                    <code className="language-javascript">
                      {`// Initialize your private AI instance
const akii = new Akii({
  apiKey: "your_api_key",
  instanceId: "your_instance_id"
});

// Make a request to your private AI
const response = await akii.complete({
  prompt: "Summarize our Q2 sales data",
  context: {
    documents: ["sales_q2.pdf"],
    metadata: { department: "sales" }
  },
  options: {
    temperature: 0.7,
    maxTokens: 500
  }
});`}
                    </code>
                  </pre>
                </motion.div>
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full opacity-50" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Powerful API Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to build powerful AI applications on top of
                your private AI instance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-6 border border-border shadow-sm"
              >
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
                <p className="text-muted-foreground">
                  Your data never leaves your private instance. Full control
                  over data privacy and security compliance.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-6 border border-border shadow-sm"
              >
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Training</h3>
                <p className="text-muted-foreground">
                  Train your AI on your company's unique data, documents, and
                  knowledge base for tailored responses.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-6 border border-border shadow-sm"
              >
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Developer-First</h3>
                <p className="text-muted-foreground">
                  Comprehensive SDKs, detailed documentation, and interactive
                  playground for rapid development.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-6 border border-border shadow-sm"
              >
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Scalable</h3>
                <p className="text-muted-foreground">
                  Handles millions of requests with low latency. Automatically
                  scales with your usage patterns.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-6 border border-border shadow-sm"
              >
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Webhooks</h3>
                <p className="text-muted-foreground">
                  Real-time event notifications and integrations with your
                  existing tools and workflows.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-6 border border-border shadow-sm"
              >
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Model Selection</h3>
                <p className="text-muted-foreground">
                  Choose from shared models or bring your own. Full flexibility
                  with model selection and configuration.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Build Anything</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your private AI API powers endless possibilities for your
                business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-8 border border-border shadow-sm"
              >
                <h3 className="text-2xl font-semibold mb-4">
                  Internal Knowledge Base
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create AI-powered knowledge bases for employee onboarding,
                  training, and compliance. Instantly answer questions based on
                  your company's documentation.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Instant answers from company documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Automated onboarding assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Compliance training and verification</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-8 border border-border shadow-sm"
              >
                <h3 className="text-2xl font-semibold mb-4">
                  Analytics Dashboard
                </h3>
                <p className="text-muted-foreground mb-6">
                  Build AI-powered analytics dashboards that summarize team or
                  customer behavior. Get actionable insights from your data in
                  natural language.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Natural language data queries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Automated insight generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Predictive analytics and forecasting</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-8 border border-border shadow-sm"
              >
                <h3 className="text-2xl font-semibold mb-4">
                  Mobile App Integration
                </h3>
                <p className="text-muted-foreground mb-6">
                  Embed AI assistants into your mobile apps to guide users based
                  on your product data. Create personalized experiences for your
                  customers.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>In-app AI assistants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Personalized user experiences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Voice-activated features</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-8 border border-border shadow-sm"
              >
                <h3 className="text-2xl font-semibold mb-4">
                  Internal Chat Platform
                </h3>
                <p className="text-muted-foreground mb-6">
                  Build custom GPT-like internal chat apps that allow team
                  members to ask operational or support-related questions in
                  natural language.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Team collaboration with AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Instant operational support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Knowledge sharing across departments</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-12 border border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6),transparent)]" />
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl font-bold mb-6">
                  Ready to build with your own private AI?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Get started today and deploy your first private AI instance in
                  minutes. No credit card required for trial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="gap-2">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default PrivateAIAPI;
