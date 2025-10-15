"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, Search, UserPlus, Edit, Trash2, Shield } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { UserManagementUser, UserRole } from "@/types/user-management"

interface UsersTableProps {
  users: UserManagementUser[]
  roles: UserRole[]
  onCreateUser: () => void
  onEditUser: (user: UserManagementUser) => void
  onToggleUserStatus: (userId: string, isActive: boolean) => void
  onDeleteUser: (userId: string) => void
}

export function UsersTable({ 
  users, 
  roles, 
  onCreateUser, 
  onEditUser, 
  onToggleUserStatus, 
  onDeleteUser 
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const getRoleInfo = (roleId: string) => {
    return roles.find(role => role.id === roleId)
  }

  const getRoleColor = (roleId: string) => {
    const role = getRoleInfo(roleId)
    const colorMap = {
      red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      orange: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
    }
    return role ? colorMap[role.color as keyof typeof colorMap] || "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-700"
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter)
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions
            </CardDescription>
          </div>
          <Button onClick={onCreateUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((roleId) => {
                      const role = getRoleInfo(roleId)
                      return (
                        <Badge 
                          key={roleId} 
                          variant="secondary" 
                          className={getRoleColor(roleId)}
                        >
                          {role?.name || roleId}
                        </Badge>
                      )
                    })}
                  </div>
                </TableCell>
                <TableCell>{user.region}</TableCell>
                <TableCell>
                  {user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy") : "Never"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={(checked) => onToggleUserStatus(user.id, checked)}
                    />
                    <span className="text-sm">
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditUser(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteUser(user.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found matching your criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}