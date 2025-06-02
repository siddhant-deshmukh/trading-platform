import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3073'; // Replace with your actual backend URL
const NEXTJS_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/'; // Replace with your actual backend URL


interface ApiResponse<T = any> {
  msg: string;
  data?: T;
  user?: T; // For login/register responses
  token?: string; // For login/register responses
}

interface FuncResponse<T> {
  err: boolean;
  status: number;
  error?: unknown;
  msg: string;
  data?: T
}


const apiCallServer = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  is_next_url?: boolean
): Promise<FuncResponse<T>> => {
  try {

    const axiosConfig: AxiosRequestConfig = {
      method,
      url: (is_next_url === true)? `${NEXTJS_BASE_URL}api${url}`: `${API_BASE_URL}${url}`,
      data,
      ...config,
    };
    //* Will send cookies by default
    axios.defaults.withCredentials = true;
    const response: AxiosResponse<T> = await axios(axiosConfig);
    const { status, data: responseData } = response;

    return { data: responseData, status, err: false, error: null, msg: '' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<T>>;
      if (axiosError.response) {
        const { status, data: errorData } = axiosError.response;
        return { err: true, status, msg: errorData.msg ?? 'Something went wrong.', error };
      } else {
        return { err: true, status: 500, msg: 'Network error or server unreachable.', error };
      }
    } else {
      return { err: true, status: 500, msg: 'An unexpected error occurred.', error };
    }
  }
};

export default apiCallServer;


// Helper functions for specific HTTP methods
export const get = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiCallServer<T>('GET', url, undefined, config);
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiCallServer<T>('POST', url, data, config);
export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  apiCallServer<T>('PUT', url, data, config);
export const del = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiCallServer<T>('DELETE', url, undefined, config);