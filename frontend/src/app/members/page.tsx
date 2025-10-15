"use client"

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter,
  Phone,
  Mail,
  MapPin,
  Activity,
  AlertCircle,
  Database
} from 'lucide-react';

export default function MembersPage() {
  return (
    <AppLayout headerTitle="Members">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Member Lookup</h1>
              <p className="text-muted-foreground text-lg">
                Search and pre-populate member data for form instances.
              </p>
            </div>
            <Button className="gap-2">
              <Database className="h-4 w-4" />
              Staging Data
            </Button>
          </div>

          {/* MVP Member Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staging Records</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,847</div>
                <p className="text-xs text-muted-foreground">
                  Available for lookup
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Searches</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+23</span> today
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pre-populated Forms</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.2%</div>
                <p className="text-xs text-muted-foreground">
                  Complete records
                </p>
              </CardContent>
            </Card>
          </div>

          {/* MVP Member Search */}
          <Card>
            <CardHeader>
              <CardTitle>Member Search & Lookup</CardTitle>
              <CardDescription>
                Search staging data to pre-populate form instances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Type to search members (name, ID, phone, email)..." 
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button>
                  Search
                </Button>
              </div>

              {/* Member List */}
              <div className="space-y-4">
                {/* Member Item */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sarah Johnson</h4>
                      <p className="text-sm text-muted-foreground">
                        Member ID: CHC-2024-001847
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          (555) 123-4567
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          sarah.j@email.com
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Chicago, IL
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="default">Available</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: Dec 10, 2024
                      </p>
                    </div>
                    <Button size="sm">
                      Select
                    </Button>
                  </div>
                </div>

                {/* Member Item */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Michael Chen</h4>
                      <p className="text-sm text-muted-foreground">
                        Member ID: CHC-2024-001823
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          (555) 987-6543
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          m.chen@email.com
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Houston, TX
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="default">Available</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: Dec 8, 2024
                      </p>
                    </div>
                    <Button size="sm">
                      Select
                    </Button>
                  </div>
                </div>

                {/* Member Item */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Emily Rodriguez</h4>
                      <p className="text-sm text-muted-foreground">
                        Member ID: CHC-2024-001756
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          (555) 456-7890
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          emily.r@email.com
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Phoenix, AZ
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="default">Available</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: Dec 5, 2024
                      </p>
                    </div>
                    <Button size="sm">
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MVP Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Advanced Search</CardTitle>
                    <CardDescription>
                      Search with multiple criteria
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Staging Data</CardTitle>
                    <CardDescription>
                      Manage staging data sources
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Search History</CardTitle>
                    <CardDescription>
                      View recent search activity
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}