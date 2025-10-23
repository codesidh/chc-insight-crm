"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { FormStatusChart } from '@/components/dashboard/form-status-chart';
import { FormActivityChart } from '@/components/dashboard/form-activity-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { SystemStatus } from '@/components/dashboard/system-status';

export default function DashboardPage() {
  return (
    <AppLayout headerTitle="Dashboard">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-6">
              {/* Welcome Section */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">CHC Insight CRM Dashboard</h1>
                <p className="text-muted-foreground text-lg">
                  Manage forms, track member engagement, and monitor system performance.
                </p>
              </div>
              
              {/* Core Metrics */}
              <DashboardMetrics />

              {/* Charts Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                <FormStatusChart />
                <FormActivityChart />
              </div>

              {/* Actions and Activity Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                <QuickActions />
                <RecentActivity />
              </div>

              {/* System Status */}
              <SystemStatus />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
