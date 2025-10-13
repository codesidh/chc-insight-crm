import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Sparkles,
  FileText,
  Copy,
  RefreshCw,
  Wand2,
  BookOpen,
  Languages,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function WordAssistantPage() {
  return (
    <AppLayout headerTitle="Word Assistant">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">AI Word Assistant</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get help with writing, editing, and improving content for surveys, communications, and documentation using AI-powered assistance.
            </p>
          </div>

          {/* Main Assistant Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Writing Assistant
              </CardTitle>
              <CardDescription>
                Describe what you need help with, and I&apos;ll assist you with writing, editing, or improving your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">What would you like help with?</label>
                <Input 
                  placeholder="e.g., Write a survey question about member satisfaction, improve this email, create a policy summary..."
                  className="text-base"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Content (optional)</label>
                <Textarea 
                  placeholder="Paste existing content here if you want me to edit or improve it..."
                  className="min-h-[120px] text-base"
                />
              </div>

              <div className="flex gap-2">
                <Button className="gap-2 flex-1">
                  <Send className="h-4 w-4" />
                  Get AI Assistance
                </Button>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Survey Questions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create clear, unbiased survey questions and response options
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-base">Member Communications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Draft emails, letters, and notifications for members
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-base">Policy Documents</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create and improve policy summaries and procedures
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Wand2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-base">Content Improvement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enhance clarity, tone, and readability of existing content
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                    <Languages className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-base">Translation & Localization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Translate content and adapt for different audiences
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                    <CheckCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-base">Compliance Review</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Review content for HIPAA and regulatory compliance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Assistance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Assistance
              </CardTitle>
              <CardDescription>
                Your recent AI writing assistance sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">Survey Question Improvement</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      &ldquo;How satisfied are you with your healthcare provider?&rdquo; → Improved clarity and removed bias
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Completed</Badge>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">Member Welcome Email</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Created personalized welcome email template for new member onboarding
                    </p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Completed</Badge>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">Policy Summary Translation</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Translated care coordination policy from English to Spanish
                    </p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Completed</Badge>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Writing Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Writing Tips & Best Practices</CardTitle>
              <CardDescription>
                Guidelines for effective healthcare communication and survey design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Survey Questions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use clear, simple language</li>
                    <li>• Avoid leading or biased questions</li>
                    <li>• Keep questions focused on one topic</li>
                    <li>• Provide balanced response options</li>
                    <li>• Test questions with target audience</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Member Communications</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use person-first language</li>
                    <li>• Write at 6th-8th grade reading level</li>
                    <li>• Include clear next steps</li>
                    <li>• Provide multiple contact options</li>
                    <li>• Ensure HIPAA compliance</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Policy Documents</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use active voice when possible</li>
                    <li>• Define technical terms</li>
                    <li>• Include relevant examples</li>
                    <li>• Structure with clear headings</li>
                    <li>• Review for accessibility</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Compliance Considerations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Protect member privacy (PHI)</li>
                    <li>• Follow ADA accessibility guidelines</li>
                    <li>• Include required disclaimers</li>
                    <li>• Use approved terminology</li>
                    <li>• Document version control</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}