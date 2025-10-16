'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkQueue } from '@/hooks/use-work-queue';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  Filter,
  Search,
  FileText,
  Users,
  Building2
} from 'lucide-react';

export default function WorkQueuePage() {
  const [activeTab, setActiveTab] = useState('my-tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const {
    tasks,
    assignTask,
    updateTaskStatus,
    getTasksByStatus,
    getTasksByPriority
  } = useWorkQueue();

  const handleTaskAction = async (taskId: string, action: string, comment?: string) => {
    try {
      await updateTaskStatus(taskId, action, comment);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="gap-1"><User className="h-3 w-3" />In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 4) return <Badge variant="destructive">High</Badge>;
    if (priority >= 3) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.formName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.memberName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || 
                           (priorityFilter === 'high' && task.priority >= 4) ||
                           (priorityFilter === 'medium' && task.priority >= 3 && task.priority < 4) ||
                           (priorityFilter === 'low' && task.priority < 3);
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const myTasks = filteredTasks.filter(task => task.assignedTo === 'current-user-id');
  const teamTasks = filteredTasks.filter(task => task.assignedTo !== 'current-user-id');

  return (
    <AppLayout headerTitle="Work Queue">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
              
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Work Queue</h1>
                  <p className="text-muted-foreground text-lg">
                    Manage form approvals and workflow tasks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{myTasks.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Assigned to me
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getTasksByStatus('pending').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting review
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getTasksByPriority(4).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Urgent tasks
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                      Past due date
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search tasks, members, or forms..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Task Lists */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>
                    Manage workflow tasks and approvals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="my-tasks" className="gap-2">
                        <User className="h-4 w-4" />
                        My Tasks ({myTasks.length})
                      </TabsTrigger>
                      <TabsTrigger value="team-tasks" className="gap-2">
                        <Users className="h-4 w-4" />
                        Team Tasks ({teamTasks.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="my-tasks" className="mt-6">
                      <div className="space-y-4">
                        {myTasks.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No tasks assigned to you
                          </div>
                        ) : (
                          myTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{task.formName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {task.memberName && (
                                      <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {task.memberName}
                                      </span>
                                    )}
                                    {task.providerName && (
                                      <span className="flex items-center gap-1 ml-2">
                                        <Building2 className="h-3 w-3" />
                                        {task.providerName}
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(task.status)}
                                    {getPriorityBadge(task.priority)}
                                    <span className="text-xs text-muted-foreground">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {task.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleTaskAction(task.id, 'rejected', 'Needs revision')}
                                    >
                                      Reject
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleTaskAction(task.id, 'approved')}
                                    >
                                      Approve
                                    </Button>
                                  </>
                                )}
                                {task.status === 'in_progress' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => handleTaskAction(task.id, 'completed')}
                                  >
                                    Complete
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="team-tasks" className="mt-6">
                      <div className="space-y-4">
                        {teamTasks.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No team tasks available
                          </div>
                        ) : (
                          teamTasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{task.formName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Assigned to: {task.assignedToName || 'Unassigned'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(task.status)}
                                    {getPriorityBadge(task.priority)}
                                    <span className="text-xs text-muted-foreground">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!task.assignedTo && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => assignTask(task.id, 'current-user-id')}
                                  >
                                    Assign to Me
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}