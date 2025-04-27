
import { apiClient } from './api-client';
import { 
  IDashboardSummary, 
  IMonthlyExpenseSummary, 
  IMonthlyCollectionSummary,
  ICategorySummary,
  IFloorSummary,
  IPlot,
  IReceivable,
  ISocietyExpense,
  IUser,
  IRole,
  IMenu,
  IRoleMenuMapping
} from '@/types/database';

export const api = {
  // Dashboard
  async getDashboardSummary() {
    return apiClient.get<IDashboardSummary>('/dashboard/summary');
  },
  
  async getMonthlyExpenses() {
    return apiClient.get<IMonthlyExpenseSummary[]>('/dashboard/expenses');
  },
  
  async getMonthlyCollections() {
    return apiClient.get<IMonthlyCollectionSummary[]>('/dashboard/collections');
  },
  
  async getCategorySummary() {
    return apiClient.get<ICategorySummary[]>('/dashboard/categories');
  },
  
  async getFloorSummary() {
    return apiClient.get<IFloorSummary[]>('/dashboard/floors');
  },
  
  // Plots
  async getPlots() {
    return apiClient.get<IPlot[]>('/plots');
  },
  
  async getPlot(id: number) {
    return apiClient.get<IPlot>(`/plots/${id}`);
  },
  
  async createPlot(plot: Partial<IPlot>) {
    return apiClient.post<{ plotId: number }>('/plots', plot);
  },
  
  async updatePlot(id: number, plot: Partial<IPlot>) {
    return apiClient.put<void>(`/plots/${id}`, plot);
  },
  
  async deletePlot(id: number) {
    return apiClient.delete<void>(`/plots/${id}`);
  },
  
  // Receivables
  async getReceivables() {
    return apiClient.get<IReceivable[]>('/receivables');
  },
  
  async createReceivable(receivable: Partial<IReceivable>) {
    return apiClient.post<{ receivableId: number }>('/receivables', receivable);
  },
  
  async updateReceivable(id: number, receivable: Partial<IReceivable>) {
    return apiClient.put<void>(`/receivables/${id}`, receivable);
  },
  
  // Expenses
  async getExpenses() {
    return apiClient.get<ISocietyExpense[]>('/expenses');
  },
  
  async createExpense(expense: Partial<ISocietyExpense>) {
    return apiClient.post<{ expenseId: number }>('/expenses', expense);
  },
  
  async updateExpense(id: number, expense: Partial<ISocietyExpense>) {
    return apiClient.put<void>(`/expenses/${id}`, expense);
  },
  
  // Users
  async getUsers() {
    return apiClient.get<IUser[]>('/users');
  },
  
  // Roles and Permissions
  async getRoles() {
    return apiClient.get<IRole[]>('/roles');
  },
  
  async getMenus() {
    return apiClient.get<IMenu[]>('/menus');
  },
  
  async getPermissions() {
    return apiClient.get<IRoleMenuMapping[]>('/Permissions');
  },
};
