import axios from 'axios';

const normalizedEnvBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
const fallbackBase =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api";

export const api = axios.create({
  baseURL: normalizedEnvBase || fallbackBase,
});
