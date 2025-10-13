import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  Search, 
  Book, 
  Video,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Users,
  Zap,
  ExternalLink
} from 'lucide-react';

export default function HelpPage() {
  return (
    <AppLayout headerTitle="Help & Support">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Help & Support Center</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find answers to your questions, access documentation, and get support for CHC Insight CRM.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search help articles, guides, and FAQs..." 
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Help Categories */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Book className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">User Guide</CardTitle>
                    <CardDescription>
                      Complete documentation and tutorials
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Step-by-step guides for all features and workflows
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Video Tutorials</CardTitle>
                    <CardDescription>
                      Watch and learn with video guides
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visual walkthroughs of key features and processes
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <HelpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">FAQs</CardTitle>
                    <CardDescription>
                      Frequently asked questions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Quick answers to common questions and issues
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Popular Help Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Help Topics</CardTitle>
              <CardDescription>
                Most searched help articles and guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">How to create a new survey</p>
                    <p className="text-xs text-muted-foreground">Step-by-step survey creation guide</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Managing member information</p>
                    <p className="text-xs text-muted-foreground">Add, edit, and organize member data</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Setting up workflows</p>
                    <p className="text-xs text-muted-foreground">Configure approval processes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Book className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Understanding analytics</p>
                    <p className="text-xs text-muted-foreground">Interpret reports and metrics</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Provider network management</p>
                    <p className="text-xs text-muted-foreground">Add and manage healthcare providers</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Compliance and reporting</p>
                    <p className="text-xs text-muted-foreground">Meet regulatory requirements</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get personalized help from our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Live Chat</p>
                    <p className="text-xs text-muted-foreground">Available Mon-Fri, 8 AM - 6 PM CST</p>
                  </div>
                  <Button size="sm">Start Chat</Button>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Phone Support</p>
                    <p className="text-xs text-muted-foreground">1-800-CHC-HELP (1-800-242-4357)</p>
                  </div>
                  <Button size="sm" variant="outline">Call Now</Button>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Email Support</p>
                    <p className="text-xs text-muted-foreground">support@chc-insight.com</p>
                  </div>
                  <Button size="sm" variant="outline">Send Email</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
                <CardDescription>
                  More ways to get help and stay informed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Book className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">API Documentation</p>
                      <p className="text-xs text-muted-foreground">Developer resources and guides</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Community Forum</p>
                      <p className="text-xs text-muted-foreground">Connect with other users</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Release Notes</p>
                      <p className="text-xs text-muted-foreground">Latest updates and features</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Training Webinars</p>
                      <p className="text-xs text-muted-foreground">Live and recorded training sessions</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system health and service availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Application Services</p>
                    <p className="text-xs text-muted-foreground">All systems operational</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Database Services</p>
                    <p className="text-xs text-muted-foreground">All systems operational</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Email Services</p>
                    <p className="text-xs text-muted-foreground">Minor delays reported</p>
                  </div>
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