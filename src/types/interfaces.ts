import { IMenuItem } from "./menu";
// Adding to existing interfaces.ts file

export interface IRole {
  roleID: number;
  roleName: string;
}

export interface IPermission {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  [action: string]: boolean;
}

export interface IPermissions {
  [path: string]: IPermission;
}

export interface IAuthUser {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  role: IRole;
  permissions: IPermissions;
  menus: IMenuItem[]; 
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IDashboardSummary {
  timeframe: string;
  totalAmount: number;
  amountReceived: number;
  amountDue: number;
  recoveryPercentage: number;
}

export interface IFinancialData {
  currentYear: IDashboardSummary;
  currentMonth: IDashboardSummary;
  lastMonth: IDashboardSummary;
  lastYear: IDashboardSummary;
}
