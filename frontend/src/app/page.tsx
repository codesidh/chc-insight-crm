import { config } from '@/config';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">{config.app.name}</h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
            Comprehensive CRM application for Long-Term Services and Supports (LTSS) business within
            Managed Care Organization (MCO) environments.
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Dynamic Surveys</h3>
              <p className="text-gray-600">
                Create and manage dynamic surveys with conditional logic and various question types.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Analytics & Reporting</h3>
              <p className="text-gray-600">
                Comprehensive dashboards and reporting tools for compliance and performance
                tracking.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Workflow Management</h3>
              <p className="text-gray-600">
                Automated workflows with approval chains and role-based access control.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Development Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Frontend Infrastructure</span>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-800">
                    Complete
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Backend Infrastructure</span>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-sm text-green-800">
                    Complete
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Survey Engine</span>
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-sm text-yellow-800">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">UI Components</span>
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-sm text-yellow-800">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
