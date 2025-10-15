"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Building2, Settings, Palette, Shield, Bell, Edit } from "lucide-react"
import { TenantConfiguration } from "@/types/user-management"

interface TenantConfigurationCardProps {
  configuration: TenantConfiguration
  onEdit: () => void
}

export function TenantConfigurationCard({ configuration, onEdit }: TenantConfigurationCardProps) {
  const config = configuration.configuration

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Tenant Configuration
            </CardTitle>
            <CardDescription>
              System settings and organizational configuration
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organization Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Organization Name</Label>
              <p className="font-medium">{configuration.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Subdomain</Label>
              <p className="font-medium">{configuration.subdomain}</p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Primary Color</Label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: config.branding.primaryColor }}
                />
                <span className="font-medium">{config.branding.primaryColor}</span>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Logo</Label>
              <p className="font-medium">{config.branding.logo}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Features
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Multi-Tenant Support</Label>
              <Badge variant={config.features.multiTenant ? "default" : "secondary"}>
                {config.features.multiTenant ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Advanced Reporting</Label>
              <Badge variant={config.features.advancedReporting ? "default" : "secondary"}>
                {config.features.advancedReporting ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">API Access</Label>
              <Badge variant={config.features.apiAccess ? "default" : "secondary"}>
                {config.features.apiAccess ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Custom Workflows</Label>
              <Badge variant={config.features.customWorkflows ? "default" : "secondary"}>
                {config.features.customWorkflows ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Settings
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Password Min Length</Label>
              <p className="font-medium">{config.security.passwordPolicy.minLength} characters</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Session Timeout</Label>
              <p className="font-medium">{config.security.sessionTimeout} minutes</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Max Login Attempts</Label>
              <p className="font-medium">{config.security.maxLoginAttempts} attempts</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Password Requirements</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {config.security.passwordPolicy.requireUppercase && (
                  <Badge variant="outline" className="text-xs">Uppercase</Badge>
                )}
                {config.security.passwordPolicy.requireLowercase && (
                  <Badge variant="outline" className="text-xs">Lowercase</Badge>
                )}
                {config.security.passwordPolicy.requireNumbers && (
                  <Badge variant="outline" className="text-xs">Numbers</Badge>
                )}
                {config.security.passwordPolicy.requireSpecialChars && (
                  <Badge variant="outline" className="text-xs">Special Chars</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Email Notifications</Label>
              <Switch checked={config.notifications.emailEnabled} disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">SMS Notifications</Label>
              <Switch checked={config.notifications.smsEnabled} disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Webhook Notifications</Label>
              <Switch checked={config.notifications.webhookEnabled} disabled />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}