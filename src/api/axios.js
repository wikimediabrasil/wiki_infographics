import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL_DEV || import.meta.env.VITE_API_URL_PROD;

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json; charset=UTF-8"
  }
});

export default api;