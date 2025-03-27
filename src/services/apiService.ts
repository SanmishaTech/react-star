import axios from 'axios';
import { backendUrl } from '../config';

const api = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const get = async (url: string, params?: any) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error: any) {
    throw { status: error.response?.status, message: error.response?.data?.errors?.message || 'Request failed' };
  }
};

export const post = async (url: string, data: any) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error: any) {
    throw { status: error.response?.status, message: error.response?.data?.errors?.message || 'Request failed' };
  }
};

export const put = async (url: string, data: any) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error: any) {
    throw { status: error.response?.status, message: error.response?.data?.errors?.message || 'Request failed' };
  }
};

export const del = async (url: string) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error: any) {
    throw { status: error.response?.status, message: error.response?.data?.errors?.message || 'Request failed' };
  }
};