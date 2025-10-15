"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { UserPlus, Save } from "lucide-react"
import { UserManagementUser, UserRole, Region, MemberPanel, ProviderNetwork, CreateUserRequest, UpdateUserRequest } from "@/types/user-management"

interface UserFormDialogProps {
  user?: UserManagementUser | null
  roles: UserRole[]
  regions: Region[]
  memberPanels: MemberPanel[]
  providerNetworks: ProviderNetwork[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void
}

export function UserFormDialog({
  user,
  roles,
  regions,
  memberPanels,
  providerNetworks,
  open,
  onOpenChange,
  onSubmit
}: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    roles: [] as string[],
    region: "",
    memberPanel: [] as string[],
    providerNetwork: [] as string[],
    isActive: true,
    sendWelcomeEmail: true
  })

  const isEditing = !!user

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        region: user.region,
        memberPanel: user.memberPanel,
        providerNetwork: user.providerNetwork,
        isActive: user.isActive,
        sendWelcomeEmail: false
      })
    } else {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        roles: [],
        region: "",
        memberPanel: [],
        providerNetwork: [],
        isActive: true,
        sendWelcomeEmail: true
      })
    }
  }, [user, open])

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId]
    }))
  }

  const handleMemberPanelToggle = (panelId: string) => {
    setFormData(prev => ({
      ...prev,
      memberPanel: prev.memberPanel.includes(panelId)
        ? prev.memberPanel.filter(p => p !== panelId)
        : [...prev.memberPanel, panelId]
    }))
  }

  const handleProviderNetworkToggle = (networkId: string) => {
    setFormData(prev => ({
      ...prev,
      providerNetwork: prev.providerNetwork.includes(networkId)
        ? prev.providerNetwork.filter(n => n !== networkId)
        : [...prev.providerNetwork, networkId]
    }))
  }

  const handleSubmit = () => {
    if (isEditing) {
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: formData.roles,
        region: formData.region,
        memberPanel: formData.memberPanel,
        providerNetwork: formData.providerNetwork,
        isActive: formData.isActive
      }
      onSubmit(updateData)
    } else {
      const createData: CreateUserRequest = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: formData.roles,
        region: formData.region,
        memberPanel: formData.memberPanel,
        providerNetwork: formData.providerNetwork,
        sendWelcomeEmail: formData.sendWelcomeEmail
      }
      onSubmit(createData)
    }
    onOpenChange(false)
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit User: ${user?.firstName} ${user?.lastName}` : "Create New User"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update user information, roles, and permissions" 
              : "Add a new user to the system with appropriate roles and access"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                disabled={isEditing}
              />
            </div>
          </div>

          {/* Roles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Roles & Permissions</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={formData.roles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{role.name}</span>
                      <Badge variant="outline">{role.permissions.length} permissions</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {role.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Region Assignment</h3>
            <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Member Panels */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Member Panels</h3>
            <div className="space-y-2">
              {memberPanels.map((panel) => (
                <div key={panel.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={formData.memberPanel.includes(panel.id)}
                      onCheckedChange={() => handleMemberPanelToggle(panel.id)}
                    />
                    <div>
                      <span className="font-medium">{panel.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({panel.memberCount} members)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Networks */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Provider Networks</h3>
            <div className="space-y-2">
              {providerNetworks.map((network) => (
                <div key={network.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={formData.providerNetwork.includes(network.id)}
                      onCheckedChange={() => handleProviderNetworkToggle(network.id)}
                    />
                    <div>
                      <span className="font-medium">{network.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({network.providerCount} providers)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status and Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status & Options</h3>
            <div className="space-y-3">
              {isEditing && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Account Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable user access
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
              )}
              {!isEditing && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send login instructions to the user
                    </p>
                  </div>
                  <Switch
                    checked={formData.sendWelcomeEmail}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendWelcomeEmail: checked }))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update User
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}