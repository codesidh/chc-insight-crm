import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Clock,
  FileText,
  Users,
  Building2,
  Workflow,
  ArrowRight
} from 'lucide-react';

export default function SearchPage() {
  return (
    <AppLayout headerTitle="Search">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Global Search</h1>
              <p className="text-muted-foreground text-lg">
                Search across all your data including members, providers, surveys, and workflows.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search members, providers, surveys, workflows..." 
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button variant="outline" className="gap-2 h-12">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button className="h-12 px-8">Search</Button>
            </div>
          </div>

          {/* Quick Search Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Search</CardTitle>
              <CardDescription>
                Search within specific categories for faster results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Members</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">Providers</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Surveys</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Workflow className="h-6 w-6" />
                  <span className="text-sm">Workflows</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Searches
              </CardTitle>
              <CardDescription>
                Your recent search queries and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">&ldquo;Sarah Johnson&rdquo;</p>
                      <p className="text-xs text-muted-foreground">Member search • 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">3 results</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">&ldquo;Chicago Medical Center&rdquo;</p>
                      <p className="text-xs text-muted-foreground">Provider search • Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">1 result</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">&ldquo;Member Satisfaction&rdquo;</p>
                      <p className="text-xs text-muted-foreground">Survey search • 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">5 results</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Results will appear here when you perform a search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No search performed yet</h3>
                <p className="text-muted-foreground mb-6">
                  Enter a search term above to find members, providers, surveys, and more.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Search tips:</strong></p>
                  <p>• Use quotes for exact phrases: &ldquo;Member ID&rdquo;</p>
                  <p>• Use wildcards: member* to find member, members, etc.</p>
                  <p>• Search by ID, name, email, or phone number</p>
                  <p>• Filter by category for more specific results</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Searches */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Searches</CardTitle>
              <CardDescription>
                Commonly searched terms and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Active members
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Pending surveys
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Chicago providers
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Workflow approvals
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Quality measures
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Member satisfaction
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Provider ratings
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Compliance reports
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Search */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search Options</CardTitle>
              <CardDescription>
                Use advanced filters and operators for precise results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="flex gap-2">
                    <Input type="date" className="text-sm" />
                    <Input type="date" className="text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full p-2 border rounded-md text-sm">
                    <option>All Categories</option>
                    <option>Members</option>
                    <option>Providers</option>
                    <option>Surveys</option>
                    <option>Workflows</option>
                    <option>Reports</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select className="w-full p-2 border rounded-md text-sm">
                    <option>Any Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button className="gap-2">
                  <Search className="h-4 w-4" />
                  Advanced Search
                </Button>
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