"use client"

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Search, 
  Filter,
  Phone,
  Mail,
  MapPin,
  Users,
  CheckCircle,
  Database,
  Activity
} from 'lucide-react';

export default function ProvidersPage() {
  return (
    <AppLayout headerTitle="Providers">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Provider Lookup</h1>
              <p className="text-muted-foreground text-lg">
                Search and pre-populate provider data for form instances.
              </p>
            </div>
            <Button className="gap-2">
              <Database className="h-4 w-4" />
              Staging Data
            </Button>
          </div>

          {/* MVP Provider Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staging Records</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
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
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12</span> today
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pre-populated Forms</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96.8%</div>
                <p className="text-xs text-muted-foreground">
                  Complete records
                </p>
              </CardContent>
            </Card>
          </div>

          {/* MVP Provider Search */}
          <Card>
            <CardHeader>
              <CardTitle>Provider Search & Lookup</CardTitle>
              <CardDescription>
                Search staging data to pre-populate form instances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Type to search providers (name, specialty, location, NPI)..." 
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

              {/* Provider List */}
              <div className="space-y-4">
                {/* Provider Item */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Chicago Medical Center</h4>
                      <p className="text-sm text-muted-foreground">
                        Primary Care • Internal Medicine
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          (312) 555-0123
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          info@chicagomedical.com
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Chicago, IL
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          247 members
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

                {/* Provider Item */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Riverside Behavioral Health</h4>
                      <p className="text-sm text-muted-foreground">
                        Mental Health • Counseling Services
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          (312) 555-0456
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          contact@riverside-bh.com
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Riverside, IL
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          89 members
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

                {/* Provider Item */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Northshore Rehabilitation Center</h4>
                      <p className="text-sm text-muted-foreground">
                        Physical Therapy • Occupational Therapy
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          (847) 555-0789
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          info@northshore-rehab.com
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          Evanston, IL
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          156 members
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