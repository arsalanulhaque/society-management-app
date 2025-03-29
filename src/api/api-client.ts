
import { IApiResponse } from '@/types/interfaces';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Generic API client for making HTTP requests to the backend
 */
class ApiClient {
  private token: string | null = null;

  constructor() {
    // Try to load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token for API requests
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Generic method to make API requests
   */
  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any
  ): Promise<IApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const jsonResponse = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: jsonResponse.message || 'API request failed',
        };
      }
      
      return {
        success: true,
        data: jsonResponse.data,
        message: jsonResponse.message,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // HTTP method wrappers
  async get<T>(endpoint: string): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, 'GET');
  }

  async post<T>(endpoint: string, data: any): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data);
  }

  async put<T>(endpoint: string, data: any): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data);
  }

  async delete<T>(endpoint: string): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
