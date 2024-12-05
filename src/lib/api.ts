import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface IApi {
    get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    post: <T>(url: string, data: any, config?: AxiosRequestConfig) => Promise<T>;
    put: <T>(url: string, data: any, config?: AxiosRequestConfig) => Promise<T>;
    patch: <T>(url: string, data: any, config?: AxiosRequestConfig) => Promise<T>;
    delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

export const api: IApi = {
    get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await axiosInstance.get(url, config);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
    post: async <T>(url: string, data: T, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
    put: async <T>(url: string, data: T, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
    patch: async <T>(url: string, data: T, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    },
    delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }
};

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_NEXTAUTH_URL + 'api',
    timeout: 50000,
    headers: {
        'Content-Type': 'application/json',
    },
});

function handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.message || error.response?.data);
    } else {
        console.error('Unexpected error:', error);
    }
}
