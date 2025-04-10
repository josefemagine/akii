import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button.tsx";
import MainLayout from "@/components/layout/MainLayout.tsx";
import { 
  Check, 
  ArrowRight, 
  Zap, 
  Share2, 
  MailOpen, 
  ListChecks,
  RefreshCw,
  Clock,
  FileText,
  Database,
  ArrowRightLeft
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
              <Share2 className="mr-1 h-4 w-4" />
              Akii.com + Zapier
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Connect <span className="text-primary">Akii AI</span> with Zapier
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect your AI Instance to thousands of apps using Zapier's no-code workflow builder — from CRMs and helpdesks to forms and spreadsheets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Use the Akii Zap <ArrowRight className="h-4 w-4" />
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
            <div className="rounded-md overflow-hidden bg-black">
              <div className="flex items-center gap-1 p-2 bg-black/90">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-white text-xs ml-2">Zapier Workflow</span>
              </div>
              <div className="p-4">
                <div className="flex items-center bg-gray-800 rounded-lg p-3 mb-3">
                  <div className="bg-orange-500 rounded-lg p-1.5 mr-3">
                    <MailOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Gmail</p>
                    <p className="text-gray-400 text-xs">New Email</p>
                  </div>
                </div>
                
                <div className="flex justify-center my-2">
                  <ArrowRightLeft className="h-6 w-6 text-gray-500 rotate-90" />
                </div>
                
                <div className="flex items-center bg-gray-800 rounded-lg p-3 mb-3">
                  <div className="bg-primary rounded-lg p-1.5 mr-3">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Akii.com AI</p>
                    <p className="text-gray-400 text-xs">Analyze Content</p>
                  </div>
                </div>
                
                <div className="flex justify-center my-2">
                  <ArrowRightLeft className="h-6 w-6 text-gray-500 rotate-90" />
                </div>
                
                <div className="flex items-center bg-gray-800 rounded-lg p-3">
                  <div className="bg-blue-500 rounded-lg p-1.5 mr-3">
                    <ListChecks className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Notion</p>
                    <p className="text-gray-400 text-xs">Create Database Item</p>
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
          <h2 className="text-3xl font-bold mb-4">Key benefits</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automate your AI workflows and connect Akii to your entire tech stack
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
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Automate AI workflows</h3>
            <p className="text-muted-foreground">
              Trigger Akii prompts when events happen in apps like Gmail, Typeform, Salesforce, or Slack. Let your AI respond to real-world events automatically.
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
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Two-way data flow</h3>
            <p className="text-muted-foreground">
              Send AI-generated responses back into tools like Notion, Google Sheets, HubSpot, or Intercom. Complete the automation loop between all your tools.
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
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time sync</h3>
            <p className="text-muted-foreground">
              Keep your AI Instance in sync with real-time business data. Ensure your AI always has the latest information when responding to queries.
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
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No-code solution</h3>
            <p className="text-muted-foreground">
              Build no-code AI workflows in minutes. Connect to 6,000+ apps without writing a single line of code. Save time and resources on integration.
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
      icon: <MailOpen className="h-6 w-6 text-primary" />,
      title: "Support ticket automation",
      description: "When a new support ticket arrives in Zendesk, trigger Akii to auto-draft a personalized reply based on ticket history and docs."
    },
    {
      icon: <Share2 className="h-6 w-6 text-primary" />,
      title: "Lead nurturing",
      description: "When a new lead enters HubSpot, use Akii to generate a personalized introduction email tailored to their industry."
    },
    {
      icon: <ListChecks className="h-6 w-6 text-primary" />,
      title: "Form submission processing",
      description: "Summarize Typeform submissions with Akii and automatically store the structured data in Notion databases."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Meeting intelligence",
      description: "Before calendar events, have Akii auto-generate meeting briefs with relevant background info on attendees from your CRM."
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Popular use cases
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            How businesses use Akii + Zapier to automate AI workflows
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
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Privacy you can trust</h3>
              <p className="text-muted-foreground">
                Akii's Zapier integration follows our strict privacy-first approach. Only the data you explicitly configure in workflows is processed, with no data retention beyond what's needed for your automated tasks. Your AI Instance remains completely isolated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const IntegrationDiagramSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect your Akii instance with Zapier in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm h-full">
              <div className="absolute -top-4 -left-4 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-xl font-semibold mb-4 mt-2">Choose Your Trigger</h3>
              <p className="text-muted-foreground mb-4">
                Select from 6,000+ apps that can trigger your Akii AI Instance when specific events occur.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                <div className="bg-muted rounded-md p-2">
                  <p className="text-xs font-medium">Gmail</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-xs font-medium">Slack</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-xs font-medium">HubSpot</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-xs font-medium">Google Calendar</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
              <ArrowRight className="h-8 w-8 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card rounded-lg p-6 border border-primary shadow-sm h-full">
              <div className="absolute -top-4 -left-4 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-xl font-semibold mb-4 mt-2">Configure Akii Response</h3>
              <p className="text-muted-foreground mb-4">
                Define exactly what you want your AI to do with the incoming data — analyze, summarize, classify, or generate content.
              </p>
              <div className="bg-black/80 rounded-md p-3 mt-6">
                <p className="text-primary text-xs font-mono mb-1">// Example prompt</p>
                <p className="text-white text-xs font-mono">Analyze this customer support request and draft a helpful response based on our product documentation.</p>
              </div>
            </div>
            <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
              <ArrowRight className="h-8 w-8 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm h-full">
              <div className="absolute -top-4 -left-4 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-xl font-semibold mb-4 mt-2">Choose Your Action</h3>
              <p className="text-muted-foreground mb-4">
                Send Akii's response to any other app to complete your workflow — update records, send messages, or create content.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                <div className="bg-muted rounded-md p-2">
                  <p className="text-xs font-medium">Notion</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-xs font-medium">Google Sheets</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-xs font-medium">Salesforce</p>
                </div>
                <div className="bg-muted rounded-md p-2">
                  <p className="text-xs font-medium">Intercom</p>
                </div>
              </div>
            </div>
          </motion.div>
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
            Start automating with Akii and Zapier today
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Start connecting Akii.com with your favorite apps today and build powerful automation workflows in minutes.
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

export default function ZapierIntegration() {
  return (
    <MainLayout>
      <HeroSection />
      <BenefitsSection />
      <UseCasesSection />
      <IntegrationDiagramSection />
      <CTASection />
    </MainLayout>
  );
} 