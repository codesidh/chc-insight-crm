import { UserManagementData } from '@/types/user-management'
import userManagementDataRaw from '@/data/app/user_management_data.json'

export function getUserManagementData(): UserManagementData {
  return userManagementDataRaw as UserManagementData
}