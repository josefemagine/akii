import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select.tsx";
import { Switch } from "../../ui/switch.tsx";
import { Input } from "../../ui/input.tsx";
import { Slider } from "../../ui/slider.tsx";
import { Globe, Mic, Brain, Clock, Repeat, Users } from "lucide-react";

interface AgentConfigSettingsProps {
  aiModels?: string[];
  languages?: string[];
  onSettingsChange?: (settings: any) => void;
}

const AgentConfigSettings = ({
  aiModels = [
    "GPT-4",
    "GPT-3.5",
    "Claude 3 Opus",
    "Claude 3 Sonnet",
    "Llama 3",
  ],
  languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Arabic",
  ],
  onSettingsChange = () => {},
}: AgentConfigSettingsProps) => {
  return (
    <div className="w-full bg-background p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Configure Agent Settings</h2>
      <p className="text-muted-foreground mb-8">
        Customize how your AI agent behaves, processes information, and
        interacts with users.
      </p>

      <Tabs defaultValue="model" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="model">AI Model</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="handoff">Handoff</TabsTrigger>
        </TabsList>

        {/* AI Model Settings */}
        <TabsContent value="model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Model Selection
              </CardTitle>
              <CardDescription>
                Choose the AI model that powers your agent. More powerful models
                provide better responses but may cost more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Model</label>
                <Select defaultValue={aiModels[0]}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Temperature</label>
                <div className="pt-2">
                  <Slider defaultValue={[0.7]} max={1} step={0.1} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lower values make responses more focused and deterministic.
                  Higher values make responses more creative and varied.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Use Advanced Reasoning
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Enables multi-step reasoning for complex questions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memory Settings */}
        <TabsContent value="memory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Memory Settings
              </CardTitle>
              <CardDescription>
                Configure how your agent remembers past interactions and uses
                context.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Short-term Memory
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Remember context within a single conversation
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Long-term Memory
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Remember user preferences across conversations
                  </p>
                </div>
                <Switch />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Context Window (messages)
                </label>
                <div className="pt-2">
                  <Slider defaultValue={[10]} min={1} max={20} step={1} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Number of previous messages to include as context for the AI
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Memory Type</label>
                <Select defaultValue="conversational">
                  <SelectTrigger>
                    <SelectValue placeholder="Select memory type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversational">
                      Conversational
                    </SelectItem>
                    <SelectItem value="semantic">Semantic</SelectItem>
                    <SelectItem value="episodic">Episodic</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Determines how your agent processes and recalls information
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Context-Aware Responses
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Enable agent to reference previous interactions
                    intelligently
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    User Preference Learning
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Automatically adapt to user preferences over time
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Memory Retention Period
                </label>
                <Select defaultValue="indefinite">
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">
                      Current Session Only
                    </SelectItem>
                    <SelectItem value="day">24 Hours</SelectItem>
                    <SelectItem value="week">1 Week</SelectItem>
                    <SelectItem value="month">30 Days</SelectItem>
                    <SelectItem value="indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  How long the agent will remember user interactions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Settings */}
        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language Settings
              </CardTitle>
              <CardDescription>
                Configure language capabilities and preferences for your agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Language</label>
                <Select defaultValue={languages[0]}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Multilingual Support
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Allow agent to respond in multiple languages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select defaultValue="professional">
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Settings */}
        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Interaction
              </CardTitle>
              <CardDescription>
                Configure voice capabilities for your agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Voice Input</label>
                  <p className="text-xs text-muted-foreground">
                    Allow users to speak to your agent
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Voice Output</label>
                  <p className="text-xs text-muted-foreground">
                    Allow your agent to speak responses
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Voice Type</label>
                <Select defaultValue="neutral">
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="feminine">Feminine</SelectItem>
                    <SelectItem value="masculine">Masculine</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Handoff Settings */}
        <TabsContent value="handoff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Human Handoff
              </CardTitle>
              <CardDescription>
                Configure when and how to transfer conversations to human
                agents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">
                    Enable Human Handoff
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Allow conversations to be transferred to human agents
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Handoff Trigger</label>
                <Select defaultValue="user_request">
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user_request">User Request</SelectItem>
                    <SelectItem value="keyword">Specific Keywords</SelectItem>
                    <SelectItem value="sentiment">
                      Negative Sentiment
                    </SelectItem>
                    <SelectItem value="complexity">Complex Issues</SelectItem>
                    <SelectItem value="multiple_failures">
                      Multiple Failed Responses
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Integration Service
                </label>
                <Select defaultValue="intercom">
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intercom">Intercom</SelectItem>
                    <SelectItem value="zendesk">Zendesk</SelectItem>
                    <SelectItem value="crisp">Crisp</SelectItem>
                    <SelectItem value="freshdesk">Freshdesk</SelectItem>
                    <SelectItem value="custom">Custom Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Webhook URL (for custom integration)
                </label>
                <Input placeholder="https://your-service.com/webhook" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentConfigSettings;
