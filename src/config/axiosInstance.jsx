import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const axiosInstance = axios.create({
  baseURL: `${BASE}/api`,
});

axiosInstance.interceptors.request.use((config) => {

  const token = localStorage.getItem("uber_token");

  if(token){
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});