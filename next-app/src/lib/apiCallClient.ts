// src/lib/apiCall.ts
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'sonner'; // Assuming sonner is installed and configured with Shadcn UI
import apiCallServer from './apiCallServer';


interface ApiResponse<T = any> {
  msg: string;
  data?: T;
  user?: T; // For login/register responses
  token?: string; // For login/register responses
}

const apiCall = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config: AxiosRequestConfig = { headers: {} },
  is_next_url?: boolean
): Promise<T | null> => {
  try {
    if (!config.headers) {
      config.headers = {};
    }
    const authToken = localStorage.getItem('authToken');
    if(authToken) {
      config.headers.Authorization = authToken;
    }

    const { data: resData, error } = await apiCallServer(method, url, data, config, is_next_url);
    if(!resData) {
      throw error
    }
    return resData
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<T>>;
      if (axiosError.response) {
        const { status, data: errorData } = axiosError.response;

        if (status === 401) {
          toast.error(errorData?.msg || 'Session expired. Please log in again.');
          // Initiate logout process
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            // You might want to redirect to login page here,
            // or dispatch a global logout action in a state management system.
            // window.location.href = '/login'; // Redirect to login page
          }
        } else {
          toast.error(errorData?.msg || 'An error occurred.');
        }
      } else {
        toast.error('Network error or server unreachable.');
      }
    } else {
      toast.error('An unexpected error occurred.');
    }
    return null;
  }
};

export default apiCall;

// Helper functions for specific HTTP methods
export const get = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiCall<T>('GET', url, undefined, config);
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiCall<T>('POST', url, data, config);
export const postNextUrl = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiCall<T>('POST', url, data, config, true);
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiCall<T>('PUT', url, data, config);
export const del = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiCall<T>('DELETE', url, undefined, config);