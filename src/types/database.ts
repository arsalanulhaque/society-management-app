
// Database interfaces based on MySQL tables

export interface IPlotType {
  TypeID: number;
  TypeName: string;
}

export interface IFloor {
  FloorID: number;
  Floor: string;
  Charges: number;
}

export interface IPlotCategory {
  CategoryID: number;
  CategoryName: string;
  CategoryType: string; // R, A, B, C, D, etc.
  Charges: number;
}

export interface IPlot {
  PlotID: number;
  HouseNo: string;
  CategoryID: number;
  FloorID: number;
  TypeID: number;
  // Joined fields
  CategoryName?: string;
  Floor?: string;
  TypeName?: string;
  Charges?: number;
}

export interface IReceivable {
  ReceivableID: number;
  PlotID: number;
  MonthYear: string; // Format: MM/YYYY
  Amount: number;
  IsPaid: boolean;
  PaidOnDate: string | null;
  // Joined fields
  HouseNo?: string;
}

export interface ISocietyExpense {
  ExpenseID: number;
  ExpanseType: string;
  ExpanseTitle: string | null;
  Description: string | null;
  MonthYear: string; // Format: MM/YYYY
  Amount: number;
  IsPaid: boolean;
  PaidOnDate: string | null;
}

export interface IUser {
  UserID: number;
  Username: string;
  Password: string; // Hashed password, never exposed to frontend
  FullName: string | null;
  Email: string | null;
  Phone: string | null;
  RoleID: number;
  // Joined fields
  RoleName?: string;
}

export interface IRole {
  RoleID: number;
  RoleName: string;
}

export interface IMenu {
  MenuID: number;
  MenuName: string;
  MenuURL: string | null;
  ParentMenuID: number | null;
  RoleID?: number | null; // Added RoleID to associate menus with roles
  // Additional fields for hierarchy
  Children?: IMenu[];
  RoleName?: string; // Added to store the role name
}

export interface IRoleMenuMapping {
  RoleMenuMappingID: number;
  RoleID: number;
  MenuID: number;
  CanView: boolean;
  CanAdd: boolean;
  CanEdit: boolean;
  CanDelete: boolean;
}

export interface IUserPlotMapping {
  UserPlotMappingID: number;
  UserID: number;
  PlotID: number;
  AssignedDate: string;
  // Joined fields
  HouseNo?: string;
  FullName?: string;
}

// Dashboard summary interfaces
export interface IDashboardSummary {
  totalPlots: number;
  totalExpenses: number;
  totalReceivables: number;
  totalPaidReceivables: number;
  pendingReceivables: number;
  collectionPercentage: number;
}

export interface IMonthlyExpenseSummary {
  month: string;
  amount: number;
}

export interface IMonthlyCollectionSummary {
  month: string;
  collected: number;
  pending: number;
}

export interface ICategorySummary {
  categoryName: string;
  count: number;
}

export interface IFloorSummary {
  floor: string;
  count: number;
}
