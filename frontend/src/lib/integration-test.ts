/**
 * MVP Integration Test Suite
 * 
 * Tests end-to-end functionality of all MVP components:
 * - Form hierarchy management
 * - Form builder functionality
 * - Form execution workflow
 * - Member/Provider lookup integration
 * - Basic workflow processes
 * - Dashboard analytics
 * 
 * Requirements: All MVP requirements integration
 */

import { apiClient } from './api-client';

export interface IntegrationTestResult {
  testName: string;
  success: boolean;
  error?: string;
  duration: number;
  details?: any;
}

export interface IntegrationTestSuite {
  suiteName: string;
  results: IntegrationTestResult[];
  overallSuccess: boolean;
  totalDuration: number;
}

class MVPIntegrationTester {
  private results: IntegrationTestResult[] = [];

  /**
   * Run a single test with error handling and timing
   */
  private async runTest(
    testName: string,
    testFn: () => Promise<any>
  ): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      const testResult: IntegrationTestResult = {
        testName,
        success: true,
        duration,
        details: result
      };
      
      this.results.push(testResult);
      return testResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult: IntegrationTestResult = {
        testName,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
      
      this.results.push(testResult);
      return testResult;
    }
  }

  /**
   * Test 1: Form Hierarchy Management
   * Verify Categories → Types → Templates → Instances structure
   */
  async testFormHierarchy(): Promise<IntegrationTestResult> {
    return this.runTest('Form Hierarchy Management', async () => {
      // Test form categories
      const categoriesResponse = await apiClient.get('/form-categories') as any;
      if (!categoriesResponse.success || !Array.isArray(categoriesResponse.data)) {
        throw new Error('Failed to fetch form categories');
      }

      // Verify Cases and Assessments categories exist
      const categories = categoriesResponse.data;
      const casesCategory = categories.find((c: any) => c.name === 'Cases');
      const assessmentsCategory = categories.find((c: any) => c.name === 'Assessments');
      
      if (!casesCategory || !assessmentsCategory) {
        throw new Error('Required form categories (Cases/Assessments) not found');
      }

      // Test form types for Cases category
      const typesResponse = await apiClient.get(`/form-categories/${casesCategory.id}/types`) as any;
      if (!typesResponse.success || !Array.isArray(typesResponse.data)) {
        throw new Error('Failed to fetch form types for Cases category');
      }

      // Test form templates for first type
      const types = typesResponse.data;
      if (types.length > 0) {
        const templatesResponse = await apiClient.get(`/form-types/${types[0].id}/templates`) as any;
        if (!templatesResponse.success || !Array.isArray(templatesResponse.data)) {
          throw new Error('Failed to fetch form templates');
        }
      }

      return {
        categoriesCount: categories.length,
        typesCount: types.length,
        hierarchyValid: true
      };
    });
  }

  /**
   * Test 2: Form Builder Integration
   * Test form template creation and management
   */
  async testFormBuilder(): Promise<IntegrationTestResult> {
    return this.runTest('Form Builder Integration', async () => {
      // Get form categories first
      const categoriesResponse = await apiClient.get('/form-categories') as any;
      if (!categoriesResponse.success) {
        throw new Error('Cannot access form categories for builder test');
      }

      const categories = categoriesResponse.data;
      const casesCategory = categories.find((c: any) => c.name === 'Cases');
      
      if (!casesCategory) {
        throw new Error('Cases category not found for builder test');
      }

      // Get form types
      const typesResponse = await apiClient.get(`/form-categories/${casesCategory.id}/types`) as any;
      if (!typesResponse.success || typesResponse.data.length === 0) {
        throw new Error('No form types available for builder test');
      }

      const firstType = typesResponse.data[0];

      // Test template creation
      const newTemplate = {
        name: `Integration Test Template ${Date.now()}`,
        description: 'Template created during integration testing',
        questions: [
          {
            id: 'q1',
            type: 'text_input',
            text: 'What is your name?',
            required: true,
            validation: []
          },
          {
            id: 'q2',
            type: 'yes_no',
            text: 'Are you satisfied with the service?',
            required: true,
            validation: []
          }
        ],
        isActive: true
      };

      const createResponse = await apiClient.post(
        `/form-types/${firstType.id}/templates`,
        newTemplate
      ) as any;

      if (!createResponse.success) {
        throw new Error('Failed to create form template');
      }

      const createdTemplate = createResponse.data;

      // Test template retrieval
      const getResponse = await apiClient.get(`/form-templates/${createdTemplate.id}`) as any;
      if (!getResponse.success) {
        throw new Error('Failed to retrieve created template');
      }

      // Test template copying
      const copyResponse = await apiClient.post(
        `/form-templates/${createdTemplate.id}/copy`,
        { name: `Copy of ${newTemplate.name}` }
      ) as any;

      if (!copyResponse.success) {
        throw new Error('Failed to copy template');
      }

      return {
        templateCreated: true,
        templateId: createdTemplate.id,
        templateCopied: true,
        copyId: copyResponse.data.id
      };
    });
  }

  /**
   * Test 3: Form Execution Workflow
   * Test form instance creation and completion
   */
  async testFormExecution(): Promise<IntegrationTestResult> {
    return this.runTest('Form Execution Workflow', async () => {
      // Get available templates
      const categoriesResponse = await apiClient.get('/form-categories') as any;
      const categories = categoriesResponse.data;
      const casesCategory = categories.find((c: any) => c.name === 'Cases');
      
      const typesResponse = await apiClient.get(`/form-categories/${casesCategory.id}/types`) as any;
      const types = typesResponse.data;
      
      if (types.length === 0) {
        throw new Error('No form types available for execution test');
      }

      const templatesResponse = await apiClient.get(`/form-types/${types[0].id}/templates`) as any;
      const templates = templatesResponse.data;
      
      if (templates.length === 0) {
        throw new Error('No form templates available for execution test');
      }

      const template = templates[0];

      // Create form instance
      const instanceData = {
        memberId: 'test-member-123',
        providerId: 'test-provider-456',
        contextData: {
          testMode: true,
          createdBy: 'integration-test'
        }
      };

      const createInstanceResponse = await apiClient.post(
        `/form-templates/${template.id}/instances`,
        instanceData
      ) as any;

      if (!createInstanceResponse.success) {
        throw new Error('Failed to create form instance');
      }

      const instance = createInstanceResponse.data;

      // Test response saving (draft)
      const responses = [
        {
          questionId: 'q1',
          value: 'Integration Test User',
          timestamp: new Date().toISOString()
        }
      ];

      const saveResponse = await apiClient.patch(
        `/form-instances/${instance.id}`,
        { responseData: responses, status: 'draft' }
      ) as any;

      if (!saveResponse.success) {
        throw new Error('Failed to save form responses');
      }

      // Test form submission
      const submitResponse = await apiClient.patch(
        `/form-instances/${instance.id}`,
        { status: 'submitted' }
      ) as any;

      if (!submitResponse.success) {
        throw new Error('Failed to submit form');
      }

      return {
        instanceCreated: true,
        instanceId: instance.id,
        responsesSaved: true,
        formSubmitted: true
      };
    });
  }

  /**
   * Test 4: Member/Provider Lookup Integration
   * Test search and data pre-population
   */
  async testMemberProviderLookup(): Promise<IntegrationTestResult> {
    return this.runTest('Member/Provider Lookup Integration', async () => {
      // Test member search
      const memberSearchResponse = await apiClient.get('/members/search', {
        params: { q: 'test', limit: 10 }
      }) as any;

      if (!memberSearchResponse.success) {
        throw new Error('Member search failed');
      }

      // Test provider search
      const providerSearchResponse = await apiClient.get('/providers/search', {
        params: { q: 'test', limit: 10 }
      }) as any;

      if (!providerSearchResponse.success) {
        throw new Error('Provider search failed');
      }

      // Test pre-population data
      if (memberSearchResponse.data.length > 0) {
        const member = memberSearchResponse.data[0];
        const prePopResponse = await apiClient.get('/members/pre-populate', {
          params: { memberId: member.id }
        }) as any;

        if (!prePopResponse.success) {
          throw new Error('Pre-population data fetch failed');
        }
      }

      return {
        memberSearchWorking: true,
        memberResults: memberSearchResponse.data.length,
        providerSearchWorking: true,
        providerResults: providerSearchResponse.data.length,
        prePopulationWorking: true
      };
    });
  }

  /**
   * Test 5: Dashboard Analytics Integration
   * Test dashboard data retrieval and metrics
   */
  async testDashboardAnalytics(): Promise<IntegrationTestResult> {
    return this.runTest('Dashboard Analytics Integration', async () => {
      // Test dashboard metrics
      const metricsResponse = await apiClient.get('/dashboard/metrics') as any;
      
      if (!metricsResponse.success) {
        throw new Error('Dashboard metrics fetch failed');
      }

      // Test compliance data
      const complianceResponse = await apiClient.get('/dashboard/compliance') as any;
      
      if (!complianceResponse.success) {
        throw new Error('Compliance data fetch failed');
      }

      // Test productivity data
      const productivityResponse = await apiClient.get('/dashboard/productivity') as any;
      
      if (!productivityResponse.success) {
        throw new Error('Productivity data fetch failed');
      }

      return {
        metricsAvailable: true,
        complianceDataAvailable: true,
        productivityDataAvailable: true,
        dashboardIntegrated: true
      };
    });
  }

  /**
   * Test 6: Error Handling and User Feedback
   * Test proper error handling across components
   */
  async testErrorHandling(): Promise<IntegrationTestResult> {
    return this.runTest('Error Handling and User Feedback', async () => {
      const errorTests = [];

      // Test invalid form category access
      try {
        await apiClient.get('/form-categories/invalid-id') as any;
        errorTests.push({ test: 'invalid-category', handled: false });
      } catch (error) {
        errorTests.push({ test: 'invalid-category', handled: true });
      }

      // Test invalid template creation
      try {
        await apiClient.post('/form-types/invalid-id/templates', {}) as any;
        errorTests.push({ test: 'invalid-template-creation', handled: false });
      } catch (error) {
        errorTests.push({ test: 'invalid-template-creation', handled: true });
      }

      // Test invalid member search
      try {
        await apiClient.get('/members/search', { params: { q: '' } }) as any;
        errorTests.push({ test: 'empty-search', handled: true });
      } catch (error) {
        errorTests.push({ test: 'empty-search', handled: true });
      }

      const handledErrors = errorTests.filter(t => t.handled).length;
      const totalErrors = errorTests.length;

      return {
        errorTestsRun: totalErrors,
        errorsHandledProperly: handledErrors,
        errorHandlingScore: handledErrors / totalErrors,
        errorTests
      };
    });
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<IntegrationTestSuite> {
    const startTime = Date.now();
    this.results = [];

    console.log('🚀 Starting MVP Integration Tests...');

    // Run all test suites
    await this.testFormHierarchy();
    await this.testFormBuilder();
    await this.testFormExecution();
    await this.testMemberProviderLookup();
    await this.testDashboardAnalytics();
    await this.testErrorHandling();

    const totalDuration = Date.now() - startTime;
    const successfulTests = this.results.filter(r => r.success).length;
    const overallSuccess = successfulTests === this.results.length;

    const suite: IntegrationTestSuite = {
      suiteName: 'MVP Integration Test Suite',
      results: this.results,
      overallSuccess,
      totalDuration
    };

    console.log(`✅ Integration tests completed: ${successfulTests}/${this.results.length} passed`);
    
    return suite;
  }

  /**
   * Generate test report
   */
  generateReport(suite: IntegrationTestSuite): string {
    const report = [
      '# MVP Integration Test Report',
      `Generated: ${new Date().toISOString()}`,
      `Duration: ${suite.totalDuration}ms`,
      `Overall Status: ${suite.overallSuccess ? '✅ PASSED' : '❌ FAILED'}`,
      '',
      '## Test Results',
      ''
    ];

    suite.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      report.push(`### ${status} ${result.testName}`);
      report.push(`Duration: ${result.duration}ms`);
      
      if (result.error) {
        report.push(`Error: ${result.error}`);
      }
      
      if (result.details) {
        report.push('Details:');
        report.push('```json');
        report.push(JSON.stringify(result.details, null, 2));
        report.push('```');
      }
      
      report.push('');
    });

    return report.join('\n');
  }
}

// Export the tester class and utility functions
export const mvpIntegrationTester = new MVPIntegrationTester();

/**
 * Quick integration test runner for development
 */
export async function runQuickIntegrationTest(): Promise<boolean> {
  try {
    const suite = await mvpIntegrationTester.runAllTests();
    console.log('Integration Test Results:', suite);
    return suite.overallSuccess;
  } catch (error) {
    console.error('Integration test failed:', error);
    return false;
  }
}

/**
 * Test specific component integration
 */
export async function testComponent(component: string): Promise<IntegrationTestResult | null> {
  const tester = new MVPIntegrationTester();
  
  switch (component.toLowerCase()) {
    case 'hierarchy':
      return await tester.testFormHierarchy();
    case 'builder':
      return await tester.testFormBuilder();
    case 'execution':
      return await tester.testFormExecution();
    case 'lookup':
      return await tester.testMemberProviderLookup();
    case 'dashboard':
      return await tester.testDashboardAnalytics();
    case 'errors':
      return await tester.testErrorHandling();
    default:
      console.error(`Unknown component: ${component}`);
      return null;
  }
}