import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { 
  ArrowRight, 
  Workflow,
  Server, 
  Shield, 
  Database,
  Code,
  Clock,
  Webhook,
  MessageSquare,
  FileText,
  Terminal,
  Cog,
  ChevronRight,
  ArrowDown
} from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-4">
              <Workflow className="mr-1 h-4 w-4" />
              Akii.com + n8n
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Full Control. <span className="text-primary">Infinite Automation.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect Akii.com to your data stack using n8n — the open-source, self-hosted workflow engine made for devs, ops teams, and privacy-first platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Explore the Akii Node <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/plans">View Plans</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-lg overflow-hidden border bg-card p-2"
          >
            <div className="rounded-md overflow-hidden bg-background/50">
              <div className="flex items-center gap-1 p-2 bg-black/90">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-white text-xs ml-2">n8n Workflow Editor</span>
              </div>
              <div className="p-3 bg-gray-900">
                <div className="flex gap-2 mb-2 items-center">
                  <div className="bg-blue-500 rounded-md p-1">
                    <Webhook className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs text-white font-medium">Webhook</div>
                  <ArrowRight className="h-4 w-4 text-gray-500" />
                  
                  <div className="bg-primary rounded-md p-1">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs text-white font-medium">Akii.com AI</div>
                  <ArrowRight className="h-4 w-4 text-gray-500" />
                  
                  <div className="bg-purple-500 rounded-md p-1">
                    <Code className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs text-white font-medium">Function</div>
                </div>
                
                <div className="bg-gray-800 rounded-md p-3 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white font-medium">Node: Akii.com AI</span>
                    <div className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-md">Active</div>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="space-y-1">
                      <div className="text-gray-400 text-xs">Operation</div>
                      <div className="bg-gray-700 rounded-md p-2 text-white text-xs flex justify-between items-center">
                        <span>Generate Response</span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400 text-xs">Input Data</div>
                      <div className="bg-gray-700 rounded-md p-2 text-white text-xs flex justify-between items-center">
                        <span>{`{{ "data": "{{$json.body}}" }}`}</span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400 text-xs">System Prompt</div>
                      <div className="bg-gray-700 rounded-md p-2 text-white text-xs">
                        <span>Analyze this data and provide insights...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const BenefitsSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Key Benefits</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful workflow automation and total control over your AI processes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border shadow-sm"
          >
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              <Workflow className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Step AI Workflows</h3>
            <p className="text-muted-foreground">
              Create complex multi-step workflows that call your Akii AI Instance at exactly the right moment in your business processes.
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
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Custom AI Chaining</h3>
            <p className="text-muted-foreground">
              Chain Akii outputs with internal systems, webhooks, and databases. Process AI results with custom code nodes for maximum flexibility.
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
              <Server className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Self-Hosted Security</h3>
            <p className="text-muted-foreground">
              Run n8n on your own infrastructure for maximum security and compliance. Ideal for sensitive data and regulated industries.
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
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Enterprise Compliance</h3>
            <p className="text-muted-foreground">
              Supports self-hosted, secure environments — fully GDPR and SOC2-aligned. Keep all your data and AI processes within your security perimeter.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const UseCasesSection = () => {
  const useCases = [
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Chat Command Automation",
      description: "When users issue a Slack command, trigger Akii to summarize a Notion document and return insights directly in the thread."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Scheduled Analysis",
      description: "Automatically run periodic reports where Akii analyzes business data, writes summary insights, and sends to email or Google Sheets."
    },
    {
      icon: <Webhook className="h-6 w-6 text-primary" />,
      title: "Event-Driven Support",
      description: "Capture inbound webhooks, use Akii to generate contextual support responses, and route to your CRM with customer details."
    },
    {
      icon: <Cog className="h-6 w-6 text-primary" />,
      title: "Internal Tool Automation",
      description: "Create complex workflows where Akii processes data and triggers custom actions in your internal systems with full data transformation."
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Popular Use Cases
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            How organizations leverage Akii + n8n for powerful AI workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border shadow-sm"
            >
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-full w-fit h-fit">
                  {useCase.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card/50 p-8 mt-12">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Database className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Data Isolation by Design</h3>
              <p className="text-muted-foreground">
                With n8n's self-hosted approach and Akii's privacy-first design, your data and AI processing remain entirely under your control. Data never leaves your environment unless you explicitly configure it to, making this integration ideal for organizations with strict security requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TechnicalDiagramSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Technical Architecture</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            How the Akii + n8n integration works under the hood
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500/10 p-2 rounded-full">
                    <Webhook className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold">1. Trigger Node</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Start workflows with events from webhooks, schedules, or any of 200+ integrated apps and services.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-6 border border-primary shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">2. Akii AI Node</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  The dedicated Akii node processes your data with custom AI instructions, accessing your private knowledge base.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/10 p-2 rounded-full">
                    <Code className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="font-semibold">3. Processing Nodes</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Transform AI outputs with code, filters, or conditional logic before sending to destination systems.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500/10 p-2 rounded-full">
                    <Terminal className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="font-semibold">4. Output Nodes</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Send processed AI data to databases, email, messaging platforms, or any other system in your stack.
                </p>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-2 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border shadow-sm h-full flex items-center justify-center"
            >
              <div className="relative w-full max-w-md">
                {/* Flow diagram visualization */}
                <div className="flex justify-center mb-8">
                  <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30 text-center w-48">
                    <Webhook className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="font-medium">Trigger</p>
                    <p className="text-xs text-muted-foreground mt-1">Webhooks, Schedule, API</p>
                  </div>
                </div>
                
                <ArrowDown className="h-8 w-8 text-primary/50 mx-auto mb-8" />
                
                <div className="flex justify-center mb-8">
                  <div className="bg-primary/20 p-4 rounded-lg border border-primary/30 text-center w-48">
                    <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">Akii AI</p>
                    <p className="text-xs text-muted-foreground mt-1">Private AI Processing</p>
                  </div>
                </div>
                
                <ArrowDown className="h-8 w-8 text-primary/50 mx-auto mb-8" />
                
                <div className="flex justify-center mb-8">
                  <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30 text-center w-48">
                    <Code className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-medium">Process</p>
                    <p className="text-xs text-muted-foreground mt-1">Transform, Filter, Route</p>
                  </div>
                </div>
                
                <ArrowDown className="h-8 w-8 text-primary/50 mx-auto mb-8" />
                
                <div className="flex justify-center">
                  <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-500/30 text-center w-48">
                    <Terminal className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="font-medium">Output</p>
                    <p className="text-xs text-muted-foreground mt-1">Database, API, Notification</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-purple-500/10">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Build Your Workflow with Akii.com
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get started with Akii.com and n8n today to create powerful, automated AI workflows for your organization.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/signup">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">
                Talk to Sales
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function N8nIntegration() {
  return (
    <MainLayout>
      <HeroSection />
      <BenefitsSection />
      <UseCasesSection />
      <TechnicalDiagramSection />
      <CTASection />
    </MainLayout>
  );
} 