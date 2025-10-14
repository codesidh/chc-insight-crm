// Utility functions to load and process application data from JSON files

import analyticsData from "@/data/app/analytics_data.json"
import dashboardData from "@/data/app/dashboard_data.json"
import membersData from "@/data/app/members_data.json"
import providersData from "@/data/app/providers_data.json"
import surveysData from "@/data/app/surveys_data.json"
import workflowsData from "@/data/app/workflows_data.json"

// Dashboard data exports
export const getDashboardData = () => dashboardData
export const getDashboardStats = () => dashboardData.stats
export const getDashboardFeatureCards = () => dashboardData.featureCards
export const getDashboardRecentActivity = () => dashboardData.recentActivity
export const getDashboardSystemStatus = () => dashboardData.systemStatus
export const getDashboardQuickActions = () => dashboardData.quickActions
export const getWelcomeMessage = () => dashboardData.welcomeMessage

// Members data exports
export const getMembersData = () => membersData
export const getMembersStats = () => membersData.stats
export const getMembers = () => membersData.members
export const getMembersQuickActions = () => membersData.quickActions
export const getMembersPageInfo = () => membersData.pageInfo

// Providers data exports
export const getProvidersData = () => providersData

// Surveys data exports
export const getSurveysData = () => surveysData

// Workflows data exports
export const getWorkflowsData = () => workflowsData

// Analytics data exports
export const getAnalyticsData = () => analyticsData

// Type definitions for better TypeScript support
export type DashboardDataType = typeof dashboardData
export type MembersDataType = typeof membersData
export type ProvidersDataType = typeof providersData
export type SurveysDataType = typeof surveysData
export type WorkflowsDataType = typeof workflowsData
export type AnalyticsDataType = typeof analyticsData