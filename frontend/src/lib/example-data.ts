// Utility functions to load and process example data from JSON files

import chartData from "@/data/examples/example_chart_data.json"
import commandData from "@/data/examples/example_command_data.json"
import formData from "@/data/examples/example_form_data.json"
import navigationData from "@/data/examples/example_navigation_data.json"

// Chart data exports
export const getChartData = () => chartData
export const getComplianceData = () => chartData.complianceData
export const getSurveyTypeData = () => chartData.surveyTypeData
export const getProductivityData = () => chartData.productivityData
export const getChartConfigs = () => chartData.chartConfigs

// Command data exports
export const getCommandData = () => commandData
export const getMembers = () => commandData.members
export const getProviders = () => commandData.providers
export const getSurveys = () => commandData.surveys
export const getQuickActions = () => commandData.quickActions
export const getNavigationItems = () => commandData.navigationItems
export const getRecentSurveys = () => commandData.recentSurveys

// Form data exports
export const getFormData = () => formData
export const getSurveyTypes = () => formData.surveyTypes
export const getReminderFrequencies = () => formData.reminderFrequencies
export const getAssessmentTypes = () => formData.assessmentTypes
export const getLevelsOfCare = () => formData.levelsOfCare
export const getCognitiveStatuses = () => formData.cognitiveStatuses
export const getCareNeedsOptions = () => formData.careNeedsOptions
export const getFormDefaults = () => formData.defaultValues

// Navigation data exports
export const getNavigationData = () => navigationData
export const getBreadcrumbs = () => navigationData.breadcrumbs
export const getPaginationData = () => navigationData.pagination
export const getSurveyDetailTabs = () => navigationData.surveyDetailTabs
export const getDashboardTabs = () => navigationData.dashboardTabs
export const getSurveyQuestions = () => navigationData.surveyQuestions
export const getLogicRules = () => navigationData.logicRules
export const getChangeHistory = () => navigationData.changeHistory
export const getDashboardMetrics = () => navigationData.dashboardMetrics

// Type definitions for better TypeScript support
export type ChartDataType = typeof chartData
export type CommandDataType = typeof commandData
export type FormDataType = typeof formData
export type NavigationDataType = typeof navigationData