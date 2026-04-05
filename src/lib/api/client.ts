import axios from 'axios';

/**
 * Base URL da API VigiDoc (Beryl Alpha).
 * Em produção, substitua pelo endereço real.
 */
export const API_BASE_URL = 'http://192.168.0.6:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});
