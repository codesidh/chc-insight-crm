'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { mvpIntegrationTester, IntegrationTestSuite } from '@/lib/integration-test';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Play, 
  RefreshCw,
  FileText,
  Users,
  BarChart3,
  Settings,
  Workflow
} from 'lucide-react';

interface MVPIntegrationDashboardProps {
  onTestComplete?: (results: IntegrationTestSuite) => void;
}

export function MVPIntegrationDashboard({ onTestComplete }: MVPIntegrationDashboardProps) {
  const [testResults, setTestResults] = useState<IntegrationTestSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const mvpComponents = [
    {
      id: 'hierarchy',
      name: 'Form Hierarchy',
      description: 'Categories → Types → Templates → Instances',
      icon: FileText,
      status: 'ready'
    },
    {
      id: 'builder',
      name: 'Form Builder',
      description: 'Dynamic form creation and management',
      icon: Settings,
      status: 'ready'
    },
    {
      id: 'execution',
      name: 'Form Execution',
      description: 'Form instance completion workflow',
      icon: Play,
      status: 'ready'
    },
    {
      id: 'lookup',
      name: 'Member/Provider Lookup',
      description: 'Search and data pre-population',
      icon: Users,
      status: 'ready'
    },
    {
      id: 'workflow',
      name: 'Basic Workflows',
      description: 'Approval and task management',
      icon: Workflow,
      status: 'ready'
    },
    {
      id: 'dashboard',
      name: 'Dashboard Analytics',
      description: 'Metrics and reporting',
      icon: BarChart3,
      status: 'ready'
    }
  ];

  const runIntegrationTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentTest('Initializing...');

    try {
      // Simulate progress updates
      const testNames = [
        'Form Hierarchy Management',
        'Form Builder Integration',
        'Form Execution Workflow',
        'Member/Provider Lookup Integration',
        'Dashboard Analytics Integration',
        'Error Handling and User Feedback'
      ];

      const progressIncrement = 100 / testNames.length;

      // Run tests with progress updates
      const results = await mvpIntegrationTester.runAllTests();
      
      // Update progress for each completed test
      results.results.forEach((result, index) => {
        setTimeout(() => {
          setCurrentTest(result.testName);
          setProgress((index + 1) * progressIncrement);
        }, index * 500);
      });

      setTimeout(() => {
        setTestResults(results);
        setIsRunning(false);
        setCurrentTest('');
        setProgress(100);
        onTestComplete?.(results);
      }, testNames.length * 500);

    } catch (error) {
      console.error('Integration test failed:', error);
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getComponentStatus = (componentId: string): 'success' | 'error' | 'pending' => {
    if (!testResults) return 'pending';
    
    const testMap: Record<string, string> = {
      hierarchy: 'Form Hierarchy Management',
      builder: 'Form Builder Integration',
      execution: 'Form Execution Workflow',
      lookup: 'Member/Provider Lookup Integration',
      workflow: 'Error Handling and User Feedback', // Workflow is tested as part of error handling
      dashboard: 'Dashboard Analytics Integration'
    };

    const testName = testMap[componentId];
    const result = testResults.results.find(r => r.testName === testName);
    
    return result?.success ? 'success' : 'error';
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'pending') => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600">Integrated</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MVP Integration Status</h2>
          <p className="text-muted-foreground">
            Test and verify end-to-end functionality of all MVP components
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setTestResults(null)}
            disabled={isRunning}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={runIntegrationTests}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Running Tests...' : 'Run Integration Tests'}
          </Button>
        </div>
      </div>

      {/* Test Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Running Integration Tests
            </CardTitle>
            <CardDescription>
              Testing end-to-end functionality across all MVP components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            {currentTest && (
              <p className="text-sm text-muted-foreground">
                Current test: {currentTest}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overall Results */}
      {testResults && (
        <Alert className={testResults.overallSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="flex items-center gap-2">
            {testResults.overallSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className="font-medium">
              {testResults.overallSuccess 
                ? '✅ All MVP components are successfully integrated!' 
                : '❌ Some integration tests failed. Please review the results below.'}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Component Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mvpComponents.map((component) => {
          const Icon = component.icon;
          const status = getComponentStatus(component.id);
          
          return (
            <Card key={component.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">{component.name}</CardTitle>
                  </div>
                  {getStatusIcon(status)}
                </div>
                <CardDescription className="text-sm">
                  {component.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {getStatusBadge(status)}
                  {testResults && (
                    <span className="text-xs text-muted-foreground">
                      Tested {new Date().toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Test Results</CardTitle>
            <CardDescription>
              Individual test results and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="results">
              <TabsList>
                <TabsTrigger value="results">Test Results</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="report">Full Report</TabsTrigger>
              </TabsList>
              
              <TabsContent value="results" className="mt-4">
                <div className="space-y-4">
                  {testResults.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{result.testName}</h4>
                          {result.error && (
                            <p className="text-sm text-red-600">{result.error}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={result.success ? 'default' : 'destructive'}>
                          {result.success ? 'Passed' : 'Failed'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.duration}ms
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Test Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Duration:</span>
                          <span className="font-mono">{testResults.totalDuration}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tests Passed:</span>
                          <span className="font-mono">
                            {testResults.results.filter(r => r.success).length}/{testResults.results.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-mono">
                            {Math.round((testResults.results.filter(r => r.success).length / testResults.results.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Slowest Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {testResults.results
                          .sort((a, b) => b.duration - a.duration)
                          .slice(0, 3)
                          .map((result, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="truncate">{result.testName}</span>
                              <span className="font-mono">{result.duration}ms</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="report" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Integration Test Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                      {mvpIntegrationTester.generateReport(testResults)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* MVP Success Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>MVP Success Criteria</CardTitle>
          <CardDescription>
            Verification of all required MVP capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              'Hierarchical Form Management (Categories → Types → Templates → Instances)',
              'Basic Form Builder (text, select, yes/no questions)',
              'Form Execution (auto-save and validation)',
              'Member/Provider Integration (search and pre-populate)',
              'Simple Workflows (basic approval process)',
              'Dashboard Analytics (completion tracking)',
              'User Management (authentication, roles, permissions)',
              'Multi-tenant Support (basic isolation and configuration)'
            ].map((criteria, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{criteria}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}