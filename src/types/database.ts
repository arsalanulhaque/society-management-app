
// Database interfaces based on MySQL tables

export interface IAction {
  ActionID: number;
  ActionName: string;
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

export interface IMenuTable {
  MenuID: number;
  MenuName: string;
  MenuURL?: string | null;
  ParentMenuID?: number | null;
  Position?: number | null;
  ParentMenuName?: string | null;
}
export interface IMenuActionsMap {
  MenuActionID: number;
  MenuID: number;
  ActionID: number;
}

export interface IRoleMenuActionsMap {
  RoleMenuActionID: number,
  RoleID: number,
  MenuID: number,
  ParentMenuID: number,
  ActionID: number,
  MenuName: string,
  ActionName: string,
  IsAllowed: number | boolean
}

export interface IMenuActionsMapView {
  MenuActionID: number;
  MenuID: number;
  ActionID: number;
  MenuName: string;
  ActionName: string;
}


export interface IPlotType {
  TypeID: number;
  TypeName: string;
}

export interface IPlotFloor {
  FloorID: number;
  Floor: string;
}

export interface IPlotCategory {
  CategoryID: number;
  CategoryName: string;
}

export interface IPlot {
  PlotID: number;
  HouseNo: string;
  // Joined fields
  CategoryID: number;
  CategoryName: string,
  FloorID: number;
  Floor: string,
  TypeID: number;
  TypeName: string
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

export interface IServiceRate {
  RateID: number;
  PlotTypeID: number;
  TypeName: string;
  PlotTypeRate: number;
  PlotCategoryID: number;
  CategoryName: string;
  PlotCategoryRate: number;
  FloorID: number;
  Floor: string;
  FloorRate: number;
  TotalAmount: number;
  StartMonth: number;
  StartYear: number,
  EndMonth: number;
  EndYear: number,
  IsActive: boolean;
}

export interface IPaymentPlan {
  PaymentPlanID: number;
  PlotID: number;
  RateID: number;
  StartDate: string; // ISO date string
  EndDate: string;   // ISO date string
  Frequency: string; // e.g. 'Monthly', 'Quarterly'
  TotalAmount: number;
  Status: string; // e.g. 'Active', 'Inactive'
}

export interface IPaymentSchedule {
  PaymentScheduleID: number;
  PlanID: number;
  DueDate: string;      // ISO date string
  Amount: number;
  IsPaid: boolean;
  PaymentDate?: string | null; // optional if not paid yet
  ReceiptID?: number | null;   // optional if not paid yet
}

export interface IPaymentReceipt {
  ReceiptID: number;
  PaymentScheduleID: number;
  PaidAmount: number;
  PaidOn: string; // ISO date string
  PaymentMode: string; // e.g. 'Cash', 'Card', 'Bank Transfer'
  ReferenceNumber?: string | null;
  Remarks?: string | null;
}
