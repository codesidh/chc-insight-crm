"use client"

import { useState } from "react"
import { AppLayout } from '@/components/layout/app-layout'
import { UsersTable } from "@/components/user-management/users-table"
import { UserFormDialog } from "@/components/user-management/user-form-dialog"
import { UserActivityCard } from "@/components/user-management/user-activity-card"
import { TenantConfigurationCard } from "@/components/user-management/tenant-configuration-card"
import { getUserManagementData } from "@/lib/user-management-data"
import { UserManagementUser, CreateUserRequest, UpdateUserRequest } from "@/types/user-management"
import { toast } from "sonner"

export default function SettingsPage() {
  const userManagementData = getUserManagementData()
  const [selectedUser, setSelectedUser] = useState<UserManagementUser | null>(null)
  const [userDialogOpen, setUserDialogOpen] = useState(false)

  const handleCreateUser = () => {
    setSelectedUser(null)
    setUserDialogOpen(true)
  }

  const handleEditUser = (user: UserManagementUser) => {
    setSelectedUser(user)
    setUserDialogOpen(true)
  }

  const handleUserSubmit = (data: CreateUserRequest | UpdateUserRequest) => {
    // In a real app, this would call the API
    if (selectedUser) {
      console.log("Updating user:", selectedUser.id, data)
      toast.success("User updated successfully")
    } else {
      console.log("Creating user:", data)
      toast.success("User created successfully", {
        description: "Welcome email has been sent to the user."
      })
    }
  }

  const handleToggleUserStatus = (userId: string, isActive: boolean) => {
    // In a real app, this would call the API
    console.log("Toggling user status:", userId, isActive)
    toast.success(isActive ? "User activated" : "User deactivated")
  }

  const handleDeleteUser = (userId: string) => {
    // In a real app, this would call the API
    console.log("Deleting user:", userId)
    toast.success("User deleted successfully")
  }

  const handleEditTenantConfiguration = () => {
    // In a real app, this would open a configuration dialog
    toast.info("Tenant configuration editing coming soon")
  }

  return (
    <AppLayout headerTitle="Settings">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
              {/* Page Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-lg">
                  Manage users, roles, permissions, and system configuration
                </p>
              </div>

              {/* Users Management */}
              <UsersTable
                users={userManagementData.users}
                roles={userManagementData.roles}
                onCreateUser={handleCreateUser}
                onEditUser={handleEditUser}
                onToggleUserStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
              />

              {/* User Activity and Tenant Configuration */}
              <div className="grid gap-6 lg:grid-cols-2">
                <UserActivityCard
                  activities={userManagementData.userActivity}
                  users={userManagementData.users}
                />
                <TenantConfigurationCard
                  configuration={userManagementData.tenantConfiguration}
                  onEdit={handleEditTenantConfiguration}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Form Dialog */}
      <UserFormDialog
        user={selectedUser}
        roles={userManagementData.roles}
        regions={userManagementData.regions}
        memberPanels={userManagementData.memberPanels}
        providerNetworks={userManagementData.providerNetworks}
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        onSubmit={handleUserSubmit}
      />
    </AppLayout>
  )
}